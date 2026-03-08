import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claims, error: authError } = await supabase.auth.getUser();
    if (authError || !claims?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, report_id, report_data } = body;

    // HESN API Configuration
    const hesnApiUrl = Deno.env.get("HESN_API_URL") || "https://hesn.moh.gov.sa/api/v1";
    const hesnApiKey = Deno.env.get("HESN_API_KEY");

    if (action === "submit_report") {
      // Build HESN FHIR-compliant payload
      const hesnPayload = {
        resourceType: "Communication",
        status: "completed",
        category: [{
          coding: [{
            system: "http://hesn.moh.gov.sa/CodeSystem/report-type",
            code: report_data.report_type,
            display: report_data.report_type === "communicable_disease"
              ? "Communicable Disease Report"
              : "Immunization Report",
          }],
        }],
        subject: {
          identifier: {
            system: "http://nphies.sa/identifier/nationalid",
            value: report_data.patient_national_id,
          },
        },
        payload: [{
          contentString: JSON.stringify({
            disease_code: report_data.disease_code,
            disease_name: report_data.disease_name,
            diagnosis_date: report_data.diagnosis_date,
            severity: report_data.severity,
            lab_confirmed: report_data.lab_confirmed,
            specimen_type: report_data.specimen_type,
            vaccination_type: report_data.vaccination_type,
            vaccination_dose: report_data.vaccination_dose_number,
          }),
        }],
        sent: new Date().toISOString(),
      };

      let submissionResult;
      if (hesnApiKey) {
        // Real HESN submission
        try {
          const response = await fetch(`${hesnApiUrl}/reports`, {
            method: "POST",
            headers: {
              "Content-Type": "application/fhir+json",
              Authorization: `Bearer ${hesnApiKey}`,
            },
            body: JSON.stringify(hesnPayload),
          });
          submissionResult = {
            status: response.ok ? "accepted" : "rejected",
            hesn_reference_id: response.ok ? `HESN-${Date.now()}` : null,
            response: await response.json().catch(() => ({ status: response.status })),
          };
        } catch (err) {
          submissionResult = {
            status: "error",
            hesn_reference_id: null,
            response: { error: String(err) },
          };
        }
      } else {
        // Sandbox/demo mode
        submissionResult = {
          status: "accepted",
          hesn_reference_id: `HESN-SANDBOX-${Date.now()}`,
          response: { message: "Sandbox mode - no HESN API key configured" },
        };
      }

      // Update the report record
      if (report_id) {
        await supabase
          .from("hesn_reports")
          .update({
            submission_status: submissionResult.status,
            hesn_reference_id: submissionResult.hesn_reference_id,
            submission_response: submissionResult.response,
            submitted_at: new Date().toISOString(),
            submitted_by: claims.user.id,
          })
          .eq("id", report_id);
      }

      return new Response(JSON.stringify(submissionResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "check_status") {
      return new Response(
        JSON.stringify({
          status: "accepted",
          message: "Status check placeholder",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const corsHeaders = getCorsHeaders(req);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

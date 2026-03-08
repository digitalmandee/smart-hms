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
    const { action, sync_data } = body;

    const sehhatyApiUrl = Deno.env.get("SEHHATY_API_URL") || "https://api.sehhaty.sa/v1";
    const sehhatyApiKey = Deno.env.get("SEHHATY_API_KEY");

    const buildPayload = () => {
      switch (sync_data.sync_type) {
        case "appointment":
          return {
            resourceType: "Appointment",
            status: "booked",
            participant: [{
              actor: {
                identifier: {
                  system: "http://nphies.sa/identifier/nationalid",
                  value: sync_data.patient_national_id,
                },
              },
            }],
            start: sync_data.appointment_date,
            description: sync_data.description,
          };
        case "lab_result":
          return {
            resourceType: "DiagnosticReport",
            status: "final",
            subject: {
              identifier: {
                system: "http://nphies.sa/identifier/nationalid",
                value: sync_data.patient_national_id,
              },
            },
            effectiveDateTime: sync_data.result_date,
            conclusion: sync_data.conclusion,
          };
        case "sick_leave":
          return {
            resourceType: "DocumentReference",
            type: {
              coding: [{
                system: "http://sehhaty.sa/CodeSystem/document-type",
                code: "e-jaza",
                display: "Electronic Sick Leave",
              }],
            },
            subject: {
              identifier: {
                system: "http://nphies.sa/identifier/nationalid",
                value: sync_data.patient_national_id,
              },
            },
            date: sync_data.issue_date,
            content: [{
              attachment: {
                contentType: "application/json",
                data: btoa(JSON.stringify({
                  start_date: sync_data.start_date,
                  end_date: sync_data.end_date,
                  days: sync_data.days,
                  diagnosis: sync_data.diagnosis,
                })),
              },
            }],
          };
        default:
          return { type: sync_data.sync_type, data: sync_data };
      }
    };

    if (action === "push") {
      const payload = buildPayload();
      let result;

      if (sehhatyApiKey) {
        try {
          const response = await fetch(`${sehhatyApiUrl}/push`, {
            method: "POST",
            headers: {
              "Content-Type": "application/fhir+json",
              Authorization: `Bearer ${sehhatyApiKey}`,
            },
            body: JSON.stringify(payload),
          });
          result = {
            status: response.ok ? "delivered" : "error",
            sehhaty_reference_id: response.ok ? `SEH-${Date.now()}` : null,
            response: await response.json().catch(() => ({ status: response.status })),
          };
        } catch (err) {
          result = { status: "error", response: { error: String(err) } };
        }
      } else {
        result = {
          status: "delivered",
          sehhaty_reference_id: `SEH-SANDBOX-${Date.now()}`,
          response: { message: "Sandbox mode" },
        };
      }

      // Log the sync
      if (sync_data.organization_id && sync_data.patient_id) {
        await supabase.from("sehhaty_sync_log").insert({
          organization_id: sync_data.organization_id,
          patient_id: sync_data.patient_id,
          sync_type: sync_data.sync_type,
          reference_id: sync_data.reference_id,
          reference_type: sync_data.reference_type,
          sehhaty_reference_id: result.sehhaty_reference_id,
          submission_status: result.status === "delivered" ? "delivered" : "error",
          submission_response: result.response,
          submitted_at: new Date().toISOString(),
          created_by: claims.user.id,
        });
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

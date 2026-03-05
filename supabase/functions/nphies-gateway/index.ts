import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, organization_id, ...params } = await req.json();

    if (!organization_id) {
      return new Response(JSON.stringify({ error: "organization_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch org NPHIES credentials
    const { data: settings, error: settingsError } = await supabase
      .from("organization_settings")
      .select("setting_key, setting_value")
      .eq("organization_id", organization_id)
      .in("setting_key", [
        "nphies_enabled",
        "nphies_environment",
        "nphies_facility_id",
        "nphies_cchi_license",
        "nphies_client_id",
        "nphies_client_secret",
        "nphies_base_url",
      ]);

    if (settingsError) throw settingsError;

    const config: Record<string, string> = {};
    settings?.forEach((s) => {
      if (s.setting_value) config[s.setting_key] = s.setting_value;
    });

    if (config.nphies_enabled !== "true") {
      return new Response(
        JSON.stringify({ error: "NPHIES integration is not enabled for this organization" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!config.nphies_client_id || !config.nphies_client_secret) {
      return new Response(
        JSON.stringify({ error: "NPHIES credentials not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const baseUrl = config.nphies_base_url || "https://hsb.nphies.sa";

    switch (action) {
      case "test_connection": {
        // Attempt OAuth token request to verify credentials
        try {
          const tokenResponse = await fetch(`${baseUrl}/oauth2/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "client_credentials",
              client_id: config.nphies_client_id,
              client_secret: config.nphies_client_secret,
            }),
          });

          if (tokenResponse.ok) {
            return new Response(
              JSON.stringify({ success: true, message: "Connection successful" }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          } else {
            const errorText = await tokenResponse.text();
            return new Response(
              JSON.stringify({ success: false, message: `Authentication failed: ${errorText}` }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } catch (fetchErr) {
          return new Response(
            JSON.stringify({ success: false, message: `Connection error: ${(fetchErr as Error).message}` }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      case "eligibility": {
        // Step 1: Get OAuth token
        const tokenRes = await fetch(`${baseUrl}/oauth2/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: config.nphies_client_id,
            client_secret: config.nphies_client_secret,
          }),
        });

        if (!tokenRes.ok) {
          const errText = await tokenRes.text();
          return new Response(
            JSON.stringify({ error: `NPHIES auth failed: ${errText}` }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        // Step 2: Build FHIR Eligibility Request
        const facilityId = config.nphies_facility_id;
        const { patient_id, insurance_policy_number, member_id } = params;

        // Get patient data
        const { data: patient } = await supabase
          .from("patients")
          .select("first_name, last_name, date_of_birth, gender, national_id")
          .eq("id", patient_id)
          .single();

        // Build FHIR CoverageEligibilityRequest
        const eligibilityRequest = {
          resourceType: "Bundle",
          type: "message",
          entry: [
            {
              resource: {
                resourceType: "MessageHeader",
                eventCoding: {
                  system: "http://nphies.sa/terminology/CodeSystem/ksa-message-events",
                  code: "eligibility-request",
                },
                source: {
                  endpoint: `http://provider.sa/${facilityId}`,
                },
                destination: [
                  {
                    endpoint: `${baseUrl}/nphies/fhir`,
                  },
                ],
              },
            },
            {
              resource: {
                resourceType: "CoverageEligibilityRequest",
                status: "active",
                purpose: ["benefits", "validation"],
                patient: {
                  reference: `Patient/${patient_id}`,
                  display: patient ? `${patient.first_name} ${patient.last_name}` : undefined,
                },
                servicedDate: new Date().toISOString().split("T")[0],
                insurer: {
                  reference: `Organization/insurer`,
                },
                insurance: [
                  {
                    coverage: {
                      reference: `Coverage/${insurance_policy_number || member_id || "unknown"}`,
                    },
                  },
                ],
              },
            },
          ],
        };

        // Step 3: Submit to NPHIES
        const eligibilityRes = await fetch(`${baseUrl}/nphies/fhir`, {
          method: "POST",
          headers: {
            "Content-Type": "application/fhir+json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(eligibilityRequest),
        });

        const eligibilityData = await eligibilityRes.json();

        // Parse FHIR response
        const eligibilityResponse = eligibilityData?.entry?.find(
          (e: { resource?: { resourceType?: string } }) =>
            e.resource?.resourceType === "CoverageEligibilityResponse"
        )?.resource;

        const isEligible = eligibilityResponse?.insurance?.[0]?.inforce === true;

        return new Response(
          JSON.stringify({
            eligible: isEligible,
            status: isEligible ? "Active" : eligibilityResponse?.outcome || "unknown",
            coverage_start: eligibilityResponse?.insurance?.[0]?.coverage?.period?.start,
            coverage_end: eligibilityResponse?.insurance?.[0]?.coverage?.period?.end,
            plan_name: eligibilityResponse?.insurance?.[0]?.coverage?.display,
            raw_response: eligibilityData,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

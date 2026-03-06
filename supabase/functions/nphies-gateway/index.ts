import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

async function getNphiesToken(baseUrl: string, clientId: string, clientSecret: string) {
  const tokenRes = await fetch(`${baseUrl}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`NPHIES auth failed: ${errText}`);
  }
  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

async function loadNphiesConfig(supabase: any, organizationId: string) {
  const { data: settings, error } = await supabase
    .from("organization_settings")
    .select("setting_key, setting_value")
    .eq("organization_id", organizationId)
    .in("setting_key", [
      "nphies_enabled", "nphies_environment", "nphies_facility_id",
      "nphies_cchi_license", "nphies_client_id", "nphies_client_secret", "nphies_base_url",
    ]);
  if (error) throw error;
  const config: Record<string, string> = {};
  settings?.forEach((s: any) => { if (s.setting_value) config[s.setting_key] = s.setting_value; });
  return config;
}

function validateConfig(config: Record<string, string>) {
  if (config.nphies_enabled !== "true") {
    throw { status: 400, message: "NPHIES integration is not enabled for this organization" };
  }
  if (!config.nphies_client_id || !config.nphies_client_secret) {
    throw { status: 400, message: "NPHIES credentials not configured" };
  }
}

// Transaction logging helper
async function logTransaction(
  supabase: any,
  organizationId: string,
  action: string,
  requestPayload: any,
  responsePayload: any,
  responseStatus: string,
  errorMessage: string | null,
  claimId: string | null,
  patientId: string | null,
  userId: string | null,
) {
  try {
    await supabase.from("nphies_transaction_logs").insert({
      organization_id: organizationId,
      action,
      request_payload: requestPayload,
      response_payload: responsePayload,
      response_status: responseStatus,
      error_message: errorMessage,
      claim_id: claimId,
      patient_id: patientId,
      user_id: userId,
    });
  } catch (logErr) {
    console.error("Failed to log NPHIES transaction:", logErr);
  }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, organization_id, user_id, ...params } = await req.json();

    if (!organization_id) {
      return new Response(JSON.stringify({ error: "organization_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const config = await loadNphiesConfig(supabase, organization_id);
    try { validateConfig(config); } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: e.status || 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const baseUrl = config.nphies_base_url || "https://hsb.nphies.sa";

    switch (action) {
      case "test_connection": {
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
          const success = tokenResponse.ok;
          const responseText = success ? "Connection successful" : await tokenResponse.text();

          await logTransaction(supabase, organization_id, "test_connection",
            { base_url: baseUrl }, { success, message: responseText },
            success ? "success" : "error", success ? null : responseText,
            null, null, user_id || null);

          if (success) {
            return new Response(
              JSON.stringify({ success: true, message: "Connection successful" }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          } else {
            return new Response(
              JSON.stringify({ success: false, message: `Authentication failed: ${responseText}` }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } catch (fetchErr) {
          await logTransaction(supabase, organization_id, "test_connection",
            { base_url: baseUrl }, null, "error", (fetchErr as Error).message,
            null, null, user_id || null);
          return new Response(
            JSON.stringify({ success: false, message: `Connection error: ${(fetchErr as Error).message}` }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      case "eligibility": {
        const accessToken = await getNphiesToken(baseUrl, config.nphies_client_id, config.nphies_client_secret);
        const facilityId = config.nphies_facility_id;
        const { patient_id, insurance_policy_number, member_id } = params;

        const { data: patient } = await supabase
          .from("patients")
          .select("first_name, last_name, date_of_birth, gender, national_id")
          .eq("id", patient_id)
          .single();

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
                source: { endpoint: `http://provider.sa/${facilityId}` },
                destination: [{ endpoint: `${baseUrl}/nphies/fhir` }],
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
                insurer: { reference: "Organization/insurer" },
                insurance: [{ coverage: { reference: `Coverage/${insurance_policy_number || member_id || "unknown"}` } }],
              },
            },
          ],
        };

        const eligibilityRes = await fetch(`${baseUrl}/nphies/fhir`, {
          method: "POST",
          headers: { "Content-Type": "application/fhir+json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(eligibilityRequest),
        });

        const eligibilityData = await eligibilityRes.json();
        const eligibilityResponse = eligibilityData?.entry?.find(
          (e: any) => e.resource?.resourceType === "CoverageEligibilityResponse"
        )?.resource;

        const isEligible = eligibilityResponse?.insurance?.[0]?.inforce === true;

        await logTransaction(supabase, organization_id, "eligibility",
          eligibilityRequest, eligibilityData,
          isEligible ? "eligible" : "not_eligible", null,
          null, patient_id || null, user_id || null);

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

      case "submit_claim": {
        const { claim_id } = params;
        if (!claim_id) {
          return new Response(JSON.stringify({ error: "claim_id required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: claim, error: claimError } = await supabase
          .from("insurance_claims")
          .select(`
            *,
            patient_insurance:patient_insurance_id (
              *,
              insurance_plan:insurance_plan_id (
                *,
                insurance_company:insurance_company_id (*)
              ),
              patient:patient_id (id, first_name, last_name, date_of_birth, gender, national_id)
            )
          `)
          .eq("id", claim_id)
          .single();

        if (claimError || !claim) {
          return new Response(JSON.stringify({ error: "Claim not found" }), {
            status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: claimItems } = await supabase
          .from("insurance_claim_items")
          .select("*")
          .eq("claim_id", claim_id);

        const accessToken = await getNphiesToken(baseUrl, config.nphies_client_id, config.nphies_client_secret);
        const facilityId = config.nphies_facility_id;
        const patient = claim.patient_insurance?.patient;
        const insuranceCompany = claim.patient_insurance?.insurance_plan?.insurance_company;

        const claimBundle = {
          resourceType: "Bundle",
          type: "message",
          entry: [
            {
              resource: {
                resourceType: "MessageHeader",
                eventCoding: {
                  system: "http://nphies.sa/terminology/CodeSystem/ksa-message-events",
                  code: "claim-request",
                },
                source: { endpoint: `http://provider.sa/${facilityId}` },
                destination: [{ endpoint: `${baseUrl}/nphies/fhir` }],
              },
            },
            {
              resource: {
                resourceType: "Claim",
                status: "active",
                type: {
                  coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/claim-type",
                    code: "institutional",
                  }],
                },
                use: "claim",
                patient: {
                  reference: `Patient/${patient?.id || "unknown"}`,
                  display: patient ? `${patient.first_name} ${patient.last_name}` : undefined,
                },
                created: new Date().toISOString(),
                insurer: {
                  reference: `Organization/${insuranceCompany?.nphies_payer_id || insuranceCompany?.id || "unknown"}`,
                  display: insuranceCompany?.name,
                },
                provider: {
                  reference: `Organization/${facilityId}`,
                },
                priority: { coding: [{ code: "normal" }] },
                insurance: [{
                  sequence: 1,
                  focal: true,
                  coverage: {
                    reference: `Coverage/${claim.patient_insurance?.policy_number || "unknown"}`,
                  },
                }],
                diagnosis: (claim.icd_codes || []).map((code: string, idx: number) => ({
                  sequence: idx + 1,
                  diagnosisCodeableConcept: {
                    coding: [{
                      system: "http://hl7.org/fhir/sid/icd-10",
                      code: code,
                    }],
                  },
                })),
                item: (claimItems || []).map((item: any, idx: number) => ({
                  sequence: idx + 1,
                  productOrService: {
                    coding: [{
                      system: "http://nphies.sa/terminology/CodeSystem/services",
                      code: item.service_code || "99999",
                      display: item.service_name,
                    }],
                  },
                  quantity: { value: item.quantity || 1 },
                  unitPrice: { value: item.unit_price || 0, currency: "SAR" },
                  net: { value: item.total_price || item.unit_price || 0, currency: "SAR" },
                  ...(item.service_date ? { servicedDate: item.service_date } : {}),
                })),
                total: {
                  value: claim.total_amount || 0,
                  currency: "SAR",
                },
              },
            },
          ],
        };

        const claimRes = await fetch(`${baseUrl}/nphies/fhir`, {
          method: "POST",
          headers: {
            "Content-Type": "application/fhir+json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(claimBundle),
        });

        const claimResponseData = await claimRes.json();
        const claimResponse = claimResponseData?.entry?.find(
          (e: any) => e.resource?.resourceType === "ClaimResponse"
        )?.resource;

        const nphiesClaimId = claimResponse?.identifier?.[0]?.value ||
          claimResponseData?.id ||
          `NPHIES-${Date.now()}`;
        const outcome = claimResponse?.outcome || (claimRes.ok ? "queued" : "error");

        const statusMap: Record<string, string> = {
          complete: "approved",
          partial: "partially_approved",
          error: "rejected",
          queued: "pending",
        };
        const nphiesStatus = statusMap[outcome] || "pending";

        const { error: updateError } = await supabase
          .from("insurance_claims")
          .update({
            nphies_claim_id: nphiesClaimId,
            nphies_status: nphiesStatus,
            nphies_response: claimResponseData,
            submission_date: new Date().toISOString(),
            status: nphiesStatus === "approved" ? "approved" : 
                   nphiesStatus === "rejected" ? "rejected" : "submitted",
          })
          .eq("id", claim_id);

        if (updateError) {
          console.error("Failed to update claim:", updateError);
        }

        await logTransaction(supabase, organization_id, "submit_claim",
          claimBundle, claimResponseData, nphiesStatus,
          nphiesStatus === "rejected" ? (claimResponse?.error?.[0]?.code?.coding?.[0]?.display || "Rejected") : null,
          claim_id, patient?.id || null, user_id || null);

        return new Response(
          JSON.stringify({
            success: claimRes.ok,
            nphies_claim_id: nphiesClaimId,
            nphies_status: nphiesStatus,
            outcome,
            adjudication: claimResponse?.adjudication,
            raw_response: claimResponseData,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "submit_preauth": {
        const { claim_id } = params;
        if (!claim_id) {
          return new Response(JSON.stringify({ error: "claim_id required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: claim, error: claimError } = await supabase
          .from("insurance_claims")
          .select(`
            *,
            patient_insurance:patient_insurance_id (
              *,
              insurance_plan:insurance_plan_id (
                *,
                insurance_company:insurance_company_id (*)
              ),
              patient:patient_id (id, first_name, last_name, date_of_birth, gender, national_id)
            )
          `)
          .eq("id", claim_id)
          .single();

        if (claimError || !claim) {
          return new Response(JSON.stringify({ error: "Claim not found" }), {
            status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: claimItems } = await supabase
          .from("insurance_claim_items")
          .select("*")
          .eq("claim_id", claim_id);

        const accessToken = await getNphiesToken(baseUrl, config.nphies_client_id, config.nphies_client_secret);
        const facilityId = config.nphies_facility_id;
        const patient = claim.patient_insurance?.patient;
        const insuranceCompany = claim.patient_insurance?.insurance_plan?.insurance_company;

        const preAuthBundle = {
          resourceType: "Bundle",
          type: "message",
          entry: [
            {
              resource: {
                resourceType: "MessageHeader",
                eventCoding: {
                  system: "http://nphies.sa/terminology/CodeSystem/ksa-message-events",
                  code: "priorauth-request",
                },
                source: { endpoint: `http://provider.sa/${facilityId}` },
                destination: [{ endpoint: `${baseUrl}/nphies/fhir` }],
              },
            },
            {
              resource: {
                resourceType: "Claim",
                status: "active",
                type: {
                  coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/claim-type",
                    code: "institutional",
                  }],
                },
                use: "preauthorization",
                patient: {
                  reference: `Patient/${patient?.id || "unknown"}`,
                  display: patient ? `${patient.first_name} ${patient.last_name}` : undefined,
                },
                created: new Date().toISOString(),
                insurer: {
                  reference: `Organization/${insuranceCompany?.nphies_payer_id || insuranceCompany?.id || "unknown"}`,
                  display: insuranceCompany?.name,
                },
                provider: {
                  reference: `Organization/${facilityId}`,
                },
                priority: { coding: [{ code: "normal" }] },
                insurance: [{
                  sequence: 1,
                  focal: true,
                  coverage: {
                    reference: `Coverage/${claim.patient_insurance?.policy_number || "unknown"}`,
                  },
                }],
                diagnosis: (claim.icd_codes || []).map((code: string, idx: number) => ({
                  sequence: idx + 1,
                  diagnosisCodeableConcept: {
                    coding: [{
                      system: "http://hl7.org/fhir/sid/icd-10",
                      code: code,
                    }],
                  },
                })),
                item: (claimItems || []).map((item: any, idx: number) => ({
                  sequence: idx + 1,
                  productOrService: {
                    coding: [{
                      system: "http://nphies.sa/terminology/CodeSystem/services",
                      code: item.service_code || "99999",
                      display: item.service_name,
                    }],
                  },
                  quantity: { value: item.quantity || 1 },
                  unitPrice: { value: item.unit_price || 0, currency: "SAR" },
                  net: { value: item.total_price || item.unit_price || 0, currency: "SAR" },
                })),
                total: {
                  value: claim.total_amount || 0,
                  currency: "SAR",
                },
              },
            },
          ],
        };

        const preAuthRes = await fetch(`${baseUrl}/nphies/fhir`, {
          method: "POST",
          headers: {
            "Content-Type": "application/fhir+json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(preAuthBundle),
        });

        const preAuthData = await preAuthRes.json();
        const preAuthResponse = preAuthData?.entry?.find(
          (e: any) => e.resource?.resourceType === "ClaimResponse"
        )?.resource;

        const preAuthNumber = preAuthResponse?.preAuthRef || 
          preAuthResponse?.identifier?.[0]?.value || 
          `PA-${Date.now()}`;
        const outcome = preAuthResponse?.outcome || (preAuthRes.ok ? "queued" : "error");

        const statusMap: Record<string, string> = {
          complete: "approved",
          partial: "partially_approved",
          error: "denied",
          queued: "pending",
        };
        const preAuthStatus = statusMap[outcome] || "pending";

        await supabase
          .from("insurance_claims")
          .update({
            pre_auth_number: preAuthNumber,
            pre_auth_status: preAuthStatus,
            pre_auth_date: new Date().toISOString().split("T")[0],
            nphies_response: preAuthData,
          })
          .eq("id", claim_id);

        await logTransaction(supabase, organization_id, "submit_preauth",
          preAuthBundle, preAuthData, preAuthStatus,
          preAuthStatus === "denied" ? (preAuthResponse?.error?.[0]?.code?.coding?.[0]?.display || "Denied") : null,
          claim_id, patient?.id || null, user_id || null);

        return new Response(
          JSON.stringify({
            success: preAuthRes.ok,
            pre_auth_number: preAuthNumber,
            pre_auth_status: preAuthStatus,
            outcome,
            raw_response: preAuthData,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "check_claim_status": {
        const { claim_id } = params;
        if (!claim_id) {
          return new Response(JSON.stringify({ error: "claim_id required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: claim, error: claimError } = await supabase
          .from("insurance_claims")
          .select("nphies_claim_id, nphies_status")
          .eq("id", claim_id)
          .single();

        if (claimError || !claim?.nphies_claim_id) {
          return new Response(JSON.stringify({ error: "No NPHIES claim ID found" }), {
            status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const accessToken = await getNphiesToken(baseUrl, config.nphies_client_id, config.nphies_client_secret);
        const facilityId = config.nphies_facility_id;

        const pollBundle = {
          resourceType: "Bundle",
          type: "message",
          entry: [
            {
              resource: {
                resourceType: "MessageHeader",
                eventCoding: {
                  system: "http://nphies.sa/terminology/CodeSystem/ksa-message-events",
                  code: "poll-request",
                },
                source: { endpoint: `http://provider.sa/${facilityId}` },
                destination: [{ endpoint: `${baseUrl}/nphies/fhir` }],
              },
            },
            {
              resource: {
                resourceType: "Parameters",
                parameter: [
                  { name: "claim-id", valueString: claim.nphies_claim_id },
                ],
              },
            },
          ],
        };

        const pollRes = await fetch(`${baseUrl}/nphies/fhir`, {
          method: "POST",
          headers: {
            "Content-Type": "application/fhir+json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(pollBundle),
        });

        const pollData = await pollRes.json();
        const claimResponse = pollData?.entry?.find(
          (e: any) => e.resource?.resourceType === "ClaimResponse"
        )?.resource;

        if (claimResponse) {
          const outcome = claimResponse.outcome || "queued";
          const statusMap: Record<string, string> = {
            complete: "approved",
            partial: "partially_approved",
            error: "rejected",
            queued: "pending",
          };
          const nphiesStatus = statusMap[outcome] || "pending";

          await supabase
            .from("insurance_claims")
            .update({
              nphies_status: nphiesStatus,
              nphies_response: pollData,
              status: nphiesStatus === "approved" ? "approved" :
                     nphiesStatus === "rejected" ? "rejected" : undefined,
            })
            .eq("id", claim_id);

          await logTransaction(supabase, organization_id, "check_claim_status",
            pollBundle, pollData, nphiesStatus, null,
            claim_id, null, user_id || null);

          return new Response(
            JSON.stringify({
              success: true,
              nphies_status: nphiesStatus,
              outcome,
              adjudication: claimResponse.adjudication,
              raw_response: pollData,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        await logTransaction(supabase, organization_id, "check_claim_status",
          pollBundle, pollData, "no_update", null,
          claim_id, null, user_id || null);

        return new Response(
          JSON.stringify({
            success: true,
            nphies_status: claim.nphies_status,
            message: "No status update available",
            raw_response: pollData,
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
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

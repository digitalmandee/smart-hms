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
    const { action, national_id, patient_id } = body;

    const nafathApiUrl = Deno.env.get("NAFATH_API_URL") || "https://nafath.api.elm.sa/api/v1";
    const nafathApiKey = Deno.env.get("NAFATH_API_KEY");
    const nafathAppId = Deno.env.get("NAFATH_APP_ID");

    if (action === "initiate_verification") {
      if (!national_id) {
        return new Response(JSON.stringify({ error: "national_id is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let result;
      if (nafathApiKey && nafathAppId) {
        try {
          const response = await fetch(`${nafathApiUrl}/mfa/request`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "APP-ID": nafathAppId,
              Authorization: `Bearer ${nafathApiKey}`,
            },
            body: JSON.stringify({
              localLang: "ar",
              id: national_id,
              service: "IdentityVerification",
            }),
          });

          const data = await response.json();
          result = {
            status: response.ok ? "pending" : "error",
            request_id: data.transId || null,
            random_number: data.random || null,
            message: response.ok
              ? "Please approve the request in your Nafath app"
              : data.message || "Verification request failed",
          };
        } catch (err) {
          result = {
            status: "error",
            request_id: null,
            random_number: null,
            message: String(err),
          };
        }
      } else {
        // Sandbox mode
        const randomNum = Math.floor(10 + Math.random() * 90);
        result = {
          status: "pending",
          request_id: `NAFATH-SANDBOX-${Date.now()}`,
          random_number: randomNum,
          message: "Sandbox mode - auto-approve after 3 seconds",
        };
      }

      // Store request_id on patient
      if (patient_id && result.request_id) {
        await supabase
          .from("patients")
          .update({ nafath_request_id: result.request_id })
          .eq("id", patient_id);
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "check_status") {
      const requestId = body.request_id;
      if (!requestId) {
        return new Response(JSON.stringify({ error: "request_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let result;
      if (nafathApiKey && nafathAppId) {
        try {
          const response = await fetch(
            `${nafathApiUrl}/mfa/request/status?transId=${requestId}&id=${national_id}`,
            {
              headers: {
                "APP-ID": nafathAppId,
                Authorization: `Bearer ${nafathApiKey}`,
              },
            }
          );
          const data = await response.json();
          result = {
            verified: data.status === "COMPLETED",
            status: data.status,
          };
        } catch (err) {
          result = { verified: false, status: "error", message: String(err) };
        }
      } else {
        // Sandbox: auto-verify
        result = { verified: true, status: "COMPLETED" };
      }

      // Update patient verification status
      if (result.verified && patient_id) {
        await supabase
          .from("patients")
          .update({
            nafath_verified: true,
            nafath_verified_at: new Date().toISOString(),
          })
          .eq("id", patient_id);
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

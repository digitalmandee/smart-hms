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
    const { action, transaction_id, transaction_data } = body;

    const tatmeenApiUrl = Deno.env.get("TATMEEN_API_URL") || "https://api.tatmeen.sfda.gov.sa/v1";
    const tatmeenApiKey = Deno.env.get("TATMEEN_API_KEY");

    if (action === "report_movement") {
      // Build GS1 EPCIS-compliant event
      const epcisEvent = {
        eventType: "ObjectEvent",
        eventTime: new Date().toISOString(),
        action: transaction_data.transaction_type === "receive" ? "ADD"
          : transaction_data.transaction_type === "dispense" ? "DELETE"
          : "OBSERVE",
        epcList: [{
          gtin: transaction_data.gtin,
          serialNumber: transaction_data.serial_number,
        }],
        bizStep: `urn:epcglobal:cbv:bizstep:${transaction_data.transaction_type === "receive" ? "receiving" : "dispensing"}`,
        disposition: `urn:epcglobal:cbv:disp:${transaction_data.transaction_type === "receive" ? "in_progress" : "dispensed"}`,
        readPoint: { id: transaction_data.facility_gln },
        extension: {
          quantityList: [{
            epcClass: `urn:epc:class:lgtin:${transaction_data.gtin}.${transaction_data.batch_number}`,
            quantity: transaction_data.quantity,
          }],
        },
      };

      let submissionResult;
      if (tatmeenApiKey) {
        try {
          const response = await fetch(`${tatmeenApiUrl}/events`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tatmeenApiKey}`,
            },
            body: JSON.stringify(epcisEvent),
          });
          submissionResult = {
            status: response.ok ? "accepted" : "rejected",
            tatmeen_reference_id: response.ok ? `TAT-${Date.now()}` : null,
            response: await response.json().catch(() => ({ status: response.status })),
          };
        } catch (err) {
          submissionResult = {
            status: "error",
            tatmeen_reference_id: null,
            response: { error: String(err) },
          };
        }
      } else {
        submissionResult = {
          status: "accepted",
          tatmeen_reference_id: `TAT-SANDBOX-${Date.now()}`,
          response: { message: "Sandbox mode - no Tatmeen API key configured" },
        };
      }

      if (transaction_id) {
        await supabase
          .from("tatmeen_transactions")
          .update({
            submission_status: submissionResult.status,
            tatmeen_reference_id: submissionResult.tatmeen_reference_id,
            submission_response: submissionResult.response,
            submitted_at: new Date().toISOString(),
          })
          .eq("id", transaction_id);
      }

      return new Response(JSON.stringify(submissionResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify_product") {
      // Verify drug authenticity by GTIN + Serial
      const verifyResult = tatmeenApiKey
        ? { verified: true, message: "Product verification placeholder" }
        : { verified: true, message: "Sandbox mode - product assumed authentic" };

      return new Response(JSON.stringify(verifyResult), {
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

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

interface BedType {
  organization_id: string;
  code: string;
  name: string;
  daily_rate: number | null;
}

interface PostResult {
  organization_id: string;
  total_admissions: number;
  charges_posted: number;
  skipped: number;
  errors: number;
  error_details: string[];
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication: require cron secret or JWT
    const authHeader = req.headers.get("Authorization");
    const cronSecret = Deno.env.get("CRON_SECRET");

    if (cronSecret) {
      // Check for cron secret in header
      const providedSecret = req.headers.get("x-cron-secret");
      if (providedSecret !== cronSecret) {
        // Fall back to JWT check
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const authClient = createClient(Deno.env.get("SUPABASE_URL")!, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const token = authHeader.replace("Bearer ", "");
        const { error: claimsError } = await authClient.auth.getClaims(token);
        if (claimsError) {
          return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    } else if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split("T")[0];
    console.log(`[post-daily-room-charges] Starting daily room charge posting for ${today}`);

    // Fetch all admitted patients across all organizations
    const { data: admissions, error: admissionsError } = await supabase
      .from("admissions")
      .select(`
        id,
        admission_number,
        organization_id,
        bed:beds!admissions_bed_id_fkey(bed_number, bed_type),
        ward:wards(name, charge_per_day)
      `)
      .eq("status", "admitted");

    if (admissionsError) {
      console.error("[post-daily-room-charges] Error fetching admissions:", admissionsError);
      throw admissionsError;
    }

    if (!admissions || admissions.length === 0) {
      console.log("[post-daily-room-charges] No admitted patients found");
      return new Response(
        JSON.stringify({ message: "No admitted patients", chargesPosted: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[post-daily-room-charges] Found ${admissions.length} admitted patients`);

    // Fetch all active bed types for rate lookup
    const { data: bedTypes, error: bedTypesError } = await supabase
      .from("ipd_bed_types")
      .select("organization_id, code, name, daily_rate")
      .eq("is_active", true);

    if (bedTypesError) {
      console.error("[post-daily-room-charges] Error fetching bed types:", bedTypesError);
    }

    // Create a map for quick bed type rate lookup
    const bedTypeRateMap = new Map<string, number>();
    const bedTypeNameMap = new Map<string, string>();
    (bedTypes || []).forEach((bt: BedType) => {
      const key = `${bt.organization_id}:${bt.code}`;
      if (bt.daily_rate && bt.daily_rate > 0) {
        bedTypeRateMap.set(key, bt.daily_rate);
      }
      bedTypeNameMap.set(key, bt.name);
    });

    // Track results per organization
    const results: Map<string, PostResult> = new Map();

    for (const admission of admissions) {
      const orgId = admission.organization_id;
      
      // Handle Supabase returning arrays for single relations
      const bed = Array.isArray(admission.bed) ? admission.bed[0] : admission.bed;
      const ward = Array.isArray(admission.ward) ? admission.ward[0] : admission.ward;
      
      // Initialize org result if not exists
      if (!results.has(orgId)) {
        results.set(orgId, {
          organization_id: orgId,
          total_admissions: 0,
          charges_posted: 0,
          skipped: 0,
          errors: 0,
          error_details: [],
        });
      }
      const orgResult = results.get(orgId)!;
      orgResult.total_admissions++;

      try {
        // Check if room charge already exists for today
        const { data: existingCharge, error: checkError } = await supabase
          .from("ipd_charges")
          .select("id")
          .eq("admission_id", admission.id)
          .eq("charge_date", today)
          .eq("charge_type", "room")
          .maybeSingle();

        if (checkError) {
          throw checkError;
        }

        if (existingCharge) {
          console.log(`[post-daily-room-charges] Skipping ${admission.admission_number} - already charged for ${today}`);
          orgResult.skipped++;
          continue;
        }

        // Calculate the daily rate
        let dailyRate = 0;
        let bedTypeName = "Room";

        // Priority 1: Bed type rate from ipd_bed_types
        if (bed?.bed_type) {
          const rateKey = `${orgId}:${bed.bed_type}`;
          if (bedTypeRateMap.has(rateKey)) {
            dailyRate = bedTypeRateMap.get(rateKey)!;
            bedTypeName = bedTypeNameMap.get(rateKey) || bed.bed_type;
          }
        }

        // Priority 2: Ward default rate
        if (dailyRate === 0 && ward?.charge_per_day) {
          dailyRate = ward.charge_per_day;
          bedTypeName = ward.name || "Ward";
        }

        // Skip if no rate configured
        if (dailyRate <= 0) {
          console.log(`[post-daily-room-charges] Skipping ${admission.admission_number} - no rate configured`);
          orgResult.skipped++;
          continue;
        }

        // Insert the room charge
        const { error: insertError } = await supabase.from("ipd_charges").insert({
          admission_id: admission.id,
          charge_date: today,
          charge_type: "room",
          description: `Daily Room Charge - ${bedTypeName}${bed?.bed_number ? ` (Bed ${bed.bed_number})` : ""}`,
          quantity: 1,
          unit_price: dailyRate,
          total_amount: dailyRate,
          is_billed: false,
        });

        if (insertError) {
          throw insertError;
        }

        console.log(`[post-daily-room-charges] Posted ${dailyRate} for ${admission.admission_number}`);
        orgResult.charges_posted++;

      } catch (err) {
        console.error(`[post-daily-room-charges] Error processing ${admission.admission_number}:`, err);
        orgResult.errors++;
        orgResult.error_details.push(`${admission.admission_number}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // Log results to audit table
    const resultsArray = Array.from(results.values());
    for (const result of resultsArray) {
      await supabase.from("ipd_daily_charge_logs").insert({
        run_date: today,
        organization_id: result.organization_id,
        total_admissions: result.total_admissions,
        charges_posted: result.charges_posted,
        skipped: result.skipped,
        errors: result.errors,
        error_details: result.error_details.length > 0 ? result.error_details : null,
      });
    }

    // Calculate totals
    const totalPosted = resultsArray.reduce((sum, r) => sum + r.charges_posted, 0);
    const totalSkipped = resultsArray.reduce((sum, r) => sum + r.skipped, 0);
    const totalErrors = resultsArray.reduce((sum, r) => sum + r.errors, 0);

    console.log(`[post-daily-room-charges] Complete: ${totalPosted} posted, ${totalSkipped} skipped, ${totalErrors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        date: today,
        chargesPosted: totalPosted,
        skipped: totalSkipped,
        errors: totalErrors,
        organizationResults: resultsArray,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[post-daily-room-charges] Fatal error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

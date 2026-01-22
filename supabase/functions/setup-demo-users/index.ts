import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createEdgeLogger } from "../_shared/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_PASSWORD = "Demo@123";

// OT Demo users to create
const OT_DEMO_USERS = [
  {
    id: "00000000-0000-0000-0000-000000000030",
    email: "surgeon@healthos.demo",
    full_name: "Dr. Ahmed Raza",
    role: "doctor",
    specialization: "General Surgery",
    specialization_code: "SURG",
    is_doctor: true,
    doctor_id: "d4444444-4444-4444-4444-444444444444",
    license_number: "PMC-SURG-001",
    consultation_fee: 3000,
  },
  {
    id: "00000000-0000-0000-0000-000000000031",
    email: "anesthetist@healthos.demo",
    full_name: "Dr. Hina Bukhari",
    role: "doctor",
    specialization: "Anesthesiology",
    specialization_code: "ANES",
    is_doctor: true,
    doctor_id: "d5555555-5555-5555-5555-555555555555",
    license_number: "PMC-ANES-001",
    consultation_fee: 2500,
  },
  {
    id: "00000000-0000-0000-0000-000000000032",
    email: "otnurse@healthos.demo",
    full_name: "Rubina Khatoon",
    role: "ot_nurse",
    is_doctor: false,
  },
];

const ORGANIZATION_ID = "b1111111-1111-1111-1111-111111111111";
const BRANCH_ID = "c1111111-1111-1111-1111-111111111111";

Deno.serve(async (req) => {
  const logger = createEdgeLogger("setup-demo-users");
  logger.invoked();

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const results: { email: string; status: string; error?: string }[] = [];

    // First, ensure Anesthesiology specialization exists
    const { data: existingAnes } = await supabaseAdmin
      .from("specializations")
      .select("id")
      .eq("organization_id", ORGANIZATION_ID)
      .eq("code", "ANES")
      .single();

    if (!existingAnes) {
      logger.info("Creating Anesthesiology specialization");
      await supabaseAdmin.from("specializations").insert({
        organization_id: ORGANIZATION_ID,
        name: "Anesthesiology",
        code: "ANES",
        category: "anesthesia",
        display_order: 19,
        is_active: true,
        description: "Anesthesia and Pain Management",
      });
    }

    // Update surgical specialization categories
    await supabaseAdmin
      .from("specializations")
      .update({ category: "surgeon" })
      .eq("organization_id", ORGANIZATION_ID)
      .in("code", ["SURG", "ORTH", "GYNE", "UROL", "ENT", "OPHT", "NEUR", "PEDI", "CARD"]);

    for (const user of OT_DEMO_USERS) {
      try {
        logger.info(`Processing user: ${user.email}`);

        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(user.id);

        let authUserExists = !!existingUser?.user;

        if (!authUserExists) {
          // Create auth user with specific ID
          const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            id: user.id,
            email: user.email,
            password: DEMO_PASSWORD,
            email_confirm: true,
            user_metadata: {
              full_name: user.full_name,
            },
          });

          if (authError) {
            logger.error(`Failed to create auth user: ${user.email}`, authError);
            results.push({ email: user.email, status: "error", error: authError.message });
            continue;
          }

          logger.info(`Created auth user: ${user.email}`);
        } else {
          logger.info(`User already exists, updating profile/roles: ${user.email}`);
        }

        // Create profile
        const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          organization_id: ORGANIZATION_ID,
          branch_id: BRANCH_ID,
          is_active: true,
        });

        if (profileError) {
          logger.error(`Failed to create profile: ${user.email}`, profileError);
        }

        // Assign role
        const { error: roleError } = await supabaseAdmin.from("user_roles").upsert({
          user_id: user.id,
          role: user.role,
        }, { onConflict: "user_id,role" });

        if (roleError) {
          logger.error(`Failed to assign role: ${user.email}`, roleError);
        }

        // Create doctor entry if applicable
        if (user.is_doctor && user.doctor_id) {
          // Get specialization ID
          const { data: specData } = await supabaseAdmin
            .from("specializations")
            .select("id")
            .eq("organization_id", ORGANIZATION_ID)
            .eq("code", user.specialization_code)
            .single();

          const { error: doctorError } = await supabaseAdmin.from("doctors").upsert({
            id: user.doctor_id,
            organization_id: ORGANIZATION_ID,
            branch_id: BRANCH_ID,
            profile_id: user.id,
            specialization: user.specialization,
            specialization_id: specData?.id,
            consultation_fee: user.consultation_fee,
            is_available: true,
            license_number: user.license_number,
          });

          if (doctorError) {
            logger.error(`Failed to create doctor: ${user.email}`, doctorError);
          }
        }

        results.push({ email: user.email, status: authUserExists ? "updated" : "created" });
      } catch (error) {
        logger.error(`Error processing user: ${user.email}`, error);
        results.push({ email: user.email, status: "error", error: String(error) });
      }
    }

    logger.success("Demo users setup completed", { results });

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    logger.error("Setup failed", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_PASSWORD = "Demo@123";

const WAREHOUSE_ORG_ID = "a1111111-1111-1111-1111-111111111111";
const WAREHOUSE_BRANCH_ID = "ab111111-1111-1111-1111-111111111111";

const WAREHOUSE_DEMO_USERS = [
  {
    id: "00000000-0000-0000-0000-000000000040",
    email: "warehouse.admin@healthos.demo",
    full_name: "Khalid Mehmood",
    first_name: "Khalid",
    last_name: "Mehmood",
    role: "warehouse_admin",
    employee_id: "e7777777-7777-7777-7777-777777777777",
    employee_number: "EMP-WH-001",
  },
  {
    id: "00000000-0000-0000-0000-000000000041",
    email: "warehouse.user@healthos.demo",
    full_name: "Tariq Hussain",
    first_name: "Tariq",
    last_name: "Hussain",
    role: "warehouse_user",
    employee_id: "e8888888-8888-8888-8888-888888888888",
    employee_number: "EMP-WH-002",
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results: { email: string; status: string; error?: string }[] = [];

    // Step 1: Create warehouse organization if not exists
    const { data: existingOrg } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .eq("id", WAREHOUSE_ORG_ID)
      .maybeSingle();

    if (!existingOrg) {
      console.log("Creating warehouse organization...");
      const { error: orgError } = await supabaseAdmin.from("organizations").insert({
        id: WAREHOUSE_ORG_ID,
        name: "Central Distribution Warehouse",
        slug: "central-distribution-warehouse",
        facility_type: "warehouse",
        email: "admin@cdwarehouse.demo",
        phone: "+92-300-0000000",
        address: "Industrial Area, Lahore",
      });
      if (orgError) {
        console.error("Failed to create org:", orgError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to create organization: " + orgError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log("Warehouse organization created");
    }

    // Step 2: Create branch if not exists
    const { data: existingBranch } = await supabaseAdmin
      .from("branches")
      .select("id")
      .eq("id", WAREHOUSE_BRANCH_ID)
      .maybeSingle();

    if (!existingBranch) {
      console.log("Creating warehouse branch...");
      const { error: branchError } = await supabaseAdmin.from("branches").insert({
        id: WAREHOUSE_BRANCH_ID,
        organization_id: WAREHOUSE_ORG_ID,
        name: "Main Warehouse",
        code: "WH-MAIN",
        address: "Industrial Area, Lahore",
        is_active: true,
      });
      if (branchError) {
        console.error("Failed to create branch:", branchError);
      } else {
        console.log("Warehouse branch created");
      }
    }

    // Step 3: Create demo users
    for (const user of WAREHOUSE_DEMO_USERS) {
      try {
        console.log(`Processing user: ${user.email}`);

        const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
        let authUserExists = !!existingUser?.user;

        if (!authUserExists) {
          const { error: authError } = await supabaseAdmin.auth.admin.createUser({
            id: user.id,
            email: user.email,
            password: DEMO_PASSWORD,
            email_confirm: true,
            user_metadata: { full_name: user.full_name },
          });

          if (authError) {
            console.error(`Failed to create auth user: ${user.email}`, authError);
            results.push({ email: user.email, status: "error", error: authError.message });
            continue;
          }
          console.log(`Created auth user: ${user.email}`);
        }

        // Wait for profile trigger
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update profile
        const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          organization_id: WAREHOUSE_ORG_ID,
          branch_id: WAREHOUSE_BRANCH_ID,
          is_active: true,
        });
        if (profileError) console.error(`Profile error: ${user.email}`, profileError);

        // Assign role
        const { error: roleError } = await supabaseAdmin.from("user_roles").upsert(
          { user_id: user.id, role: user.role },
          { onConflict: "user_id,role" }
        );
        if (roleError) console.error(`Role error: ${user.email}`, roleError);

        // Create employee
        const { data: existingEmp } = await supabaseAdmin
          .from("employees")
          .select("id")
          .eq("profile_id", user.id)
          .maybeSingle();

        if (!existingEmp) {
          const { error: empError } = await supabaseAdmin.from("employees").insert({
            id: user.employee_id,
            organization_id: WAREHOUSE_ORG_ID,
            branch_id: WAREHOUSE_BRANCH_ID,
            profile_id: user.id,
            employee_number: user.employee_number,
            first_name: user.first_name,
            last_name: user.last_name,
            work_email: user.email,
            employee_type: "permanent",
            employment_status: "active",
            join_date: new Date().toISOString().split("T")[0],
          });
          if (empError) console.error(`Employee error: ${user.email}`, empError);
        }

        results.push({ email: user.email, status: authUserExists ? "updated" : "created" });
      } catch (error) {
        console.error(`Error processing: ${user.email}`, error);
        results.push({ email: user.email, status: "error", error: String(error) });
      }
    }

    console.log("Warehouse demo setup complete:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Setup failed:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

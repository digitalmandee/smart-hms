import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateStaffRequest {
  // Account (optional - if provided, creates login)
  email?: string;
  password?: string;
  
  // Personal
  first_name: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  
  // Organization
  organization_id: string;
  branch_id?: string;
  department_id?: string;
  designation_id?: string;
  category_id?: string;
  
  // Roles (required if creating login)
  roles?: string[];
  
  // Employment
  join_date?: string;
  shift_id?: string;
  
  // Clinical data (for doctors)
  specialization_id?: string;
  qualification?: string;
  license_number?: string;
  consultation_fee?: number;
  
  // Nurse data
  nurse_specialization?: string;
  nurse_qualification?: string;
  assigned_ward_id?: string;
  is_charge_nurse?: boolean;
  nurse_license_number?: string;
}

interface CreateStaffResponse {
  success: boolean;
  user_id?: string;
  profile_id?: string;
  employee_id?: string;
  doctor_id?: string;
  nurse_id?: string;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Get auth header for permission check
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify caller has admin permissions
    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user: callerUser }, error: authError } = await userClient.auth.getUser();
    if (authError || !callerUser) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check caller is org_admin or super_admin
    const { data: callerRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUser.id);
    
    const isAdmin = callerRoles?.some(r => 
      r.role === "super_admin" || r.role === "org_admin" || r.role === "branch_admin"
    );
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: "Insufficient permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const data: CreateStaffRequest = await req.json();
    console.log("Creating staff member:", { ...data, password: "[REDACTED]" });

    const response: CreateStaffResponse = { success: true };
    let profileId: string | null = null;

    // Step 1: Create auth user if email/password provided
    if (data.email && data.password) {
      console.log("Creating auth user for:", data.email);
      
      const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          full_name: `${data.first_name}${data.last_name ? " " + data.last_name : ""}`,
        },
      });

      if (createUserError) {
        console.error("Failed to create auth user:", createUserError);
        return new Response(
          JSON.stringify({ success: false, error: createUserError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      response.user_id = authData.user.id;
      profileId = authData.user.id;
      console.log("Auth user created:", response.user_id);

      // Wait briefly for profile trigger to execute
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Update profile with organization details
      const { error: profileUpdateError } = await supabaseAdmin
        .from("profiles")
        .update({
          full_name: `${data.first_name}${data.last_name ? " " + data.last_name : ""}`,
          phone: data.phone || null,
          organization_id: data.organization_id,
          branch_id: data.branch_id || null,
        })
        .eq("id", profileId);

      if (profileUpdateError) {
        console.error("Failed to update profile:", profileUpdateError);
      }

      response.profile_id = profileId;

      // Step 3: Insert roles
      if (data.roles && data.roles.length > 0) {
        const roleInserts = data.roles.map(role => ({
          user_id: profileId,
          role,
        }));

        const { error: rolesError } = await supabaseAdmin
          .from("user_roles")
          .insert(roleInserts);

        if (rolesError) {
          console.error("Failed to insert roles:", rolesError);
        } else {
          console.log("Roles assigned:", data.roles);
        }
      }
    }

    // Step 4: Generate employee number
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const { count } = await supabaseAdmin
      .from("employees")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", data.organization_id)
      .ilike("employee_number", `EMP-${datePart}-%`);
    
    const seqNum = (count || 0) + 1;
    const employeeNumber = `EMP-${datePart}-${String(seqNum).padStart(4, "0")}`;

    // Step 5: Create employee record
    const employeeData: Record<string, unknown> = {
      organization_id: data.organization_id,
      branch_id: data.branch_id || null,
      employee_number: employeeNumber,
      first_name: data.first_name,
      last_name: data.last_name || null,
      phone: data.phone || null,
      gender: data.gender || null,
      date_of_birth: data.date_of_birth || null,
      department_id: data.department_id || null,
      designation_id: data.designation_id || null,
      category_id: data.category_id || null,
      shift_id: data.shift_id || null,
      join_date: data.join_date || new Date().toISOString().slice(0, 10),
      employment_status: "active",
    };

    // Link to profile if created
    if (profileId) {
      employeeData.profile_id = profileId;
    }

    const { data: employee, error: employeeError } = await supabaseAdmin
      .from("employees")
      .insert(employeeData)
      .select()
      .single();

    if (employeeError) {
      console.error("Failed to create employee:", employeeError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create employee record: " + employeeError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    response.employee_id = employee.id;
    console.log("Employee created:", employeeNumber);

    // Step 6: Create doctor record if clinical role
    const clinicalRoles = ["doctor", "surgeon", "anesthetist"];
    const hasClinicalRole = data.roles?.some(r => clinicalRoles.includes(r));

    if (hasClinicalRole && profileId) {
      const doctorData: Record<string, unknown> = {
        organization_id: data.organization_id,
        profile_id: profileId,
        employee_id: employee.id,
        name: `${data.first_name}${data.last_name ? " " + data.last_name : ""}`,
        specialization_id: data.specialization_id || null,
        qualification: data.qualification || null,
        license_number: data.license_number || null,
        consultation_fee: data.consultation_fee || 0,
        is_available: true,
      };

      const { data: doctor, error: doctorError } = await supabaseAdmin
        .from("doctors")
        .insert(doctorData)
        .select()
        .single();

      if (doctorError) {
        console.error("Failed to create doctor:", doctorError);
      } else {
        response.doctor_id = doctor.id;
        console.log("Doctor record created");
      }
    }

    // Step 7: Create nurse record if nursing role
    const nursingRoles = ["nurse", "opd_nurse", "ipd_nurse", "ot_nurse"];
    const hasNursingRole = data.roles?.some(r => nursingRoles.includes(r));

    if (hasNursingRole && profileId) {
      const nurseData: Record<string, unknown> = {
        organization_id: data.organization_id,
        profile_id: profileId,
        employee_id: employee.id,
        name: `${data.first_name}${data.last_name ? " " + data.last_name : ""}`,
        specialization: data.nurse_specialization || null,
        qualification: data.nurse_qualification || null,
        license_number: data.nurse_license_number || null,
        assigned_ward_id: data.assigned_ward_id || null,
        is_charge_nurse: data.is_charge_nurse || false,
        is_available: true,
      };

      const { data: nurse, error: nurseError } = await supabaseAdmin
        .from("nurses")
        .insert(nurseData)
        .select()
        .single();

      if (nurseError) {
        console.error("Failed to create nurse:", nurseError);
      } else {
        response.nurse_id = nurse.id;
        console.log("Nurse record created");
      }
    }

    console.log("Staff creation complete:", response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error creating staff:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

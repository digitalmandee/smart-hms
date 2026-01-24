import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppRole } from "@/constants/roles";

export interface CreateStaffInput {
  // Account (optional)
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
  
  // Roles
  roles?: AppRole[];
  
  // Employment
  join_date?: string;
  shift_id?: string;
  
  // Clinical (doctors)
  specialization_id?: string;
  qualification?: string;
  license_number?: string;
  consultation_fee?: number;
  
  // Nursing
  nurse_specialization?: string;
  nurse_qualification?: string;
  assigned_ward_id?: string;
  is_charge_nurse?: boolean;
  nurse_license_number?: string;
}

export interface CreateStaffResponse {
  success: boolean;
  user_id?: string;
  profile_id?: string;
  employee_id?: string;
  doctor_id?: string;
  nurse_id?: string;
  error?: string;
}

export function useCreateStaffUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateStaffInput): Promise<CreateStaffResponse> => {
      const { data, error } = await supabase.functions.invoke<CreateStaffResponse>(
        "create-staff-user",
        { body: input }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || "Failed to create staff member");
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["nurses"] });

      toast({
        title: "Staff member created",
        description: data.user_id 
          ? "User account and employee record created successfully."
          : "Employee record created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create staff",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Helper to generate a random password
export function generateRandomPassword(length = 12): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "!@#$%^&*";
  const all = lowercase + uppercase + numbers + special;
  
  let password = "";
  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle
  return password.split("").sort(() => Math.random() - 0.5).join("");
}

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  useEmployee,
  useCreateEmployee,
  useUpdateEmployee,
  useDepartments,
  useDesignations,
  useEmployeeCategories,
  useShifts,
} from "@/hooks/useHR";
import { useBranches } from "@/hooks/useBranches";
import { useDoctorByEmployeeId, useCreateDoctorForEmployee } from "@/hooks/useDoctors";
import { useNurseByEmployeeId, useCreateNurseForEmployee, NURSE_SPECIALIZATIONS } from "@/hooks/useNurses";
import { useAuth } from "@/contexts/AuthContext";
import { DoctorDetailsForm } from "@/components/hr/DoctorDetailsForm";
import { NurseDetailsForm } from "@/components/hr/NurseDetailsForm";
import { DoctorCompensationForm } from "@/components/hr/DoctorCompensationForm";
import { LoginAccountSection } from "@/components/hr/LoginAccountSection";
import { DocumentUploadSection, type PendingDocument } from "@/components/hr/DocumentUploadSection";
import { useCreateStaffUser } from "@/hooks/useStaffManagement";
import { useCreateEmployeeDocument } from "@/hooks/useEmployeeDocuments";
import { supabase } from "@/integrations/supabase/client";
import { type AppRole } from "@/constants/roles";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { isValidSaudiId } from "@/lib/validations/saudiId";
import { Loader2, Save, ArrowLeft, Stethoscope, Heart, FileText, Wallet } from "lucide-react";

const employeeSchema = z.object({
  employee_number: z.string().min(1, "Employee number is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  date_of_birth: z.string().optional(),
  personal_phone: z.string().optional(),
  personal_email: z.string().email().optional().or(z.literal("")),
  national_id: z.string().optional(),
  current_address: z.string().optional(),
  permanent_address: z.string().optional(),
  branch_id: z.string().optional(),
  department_id: z.string().optional(),
  designation_id: z.string().optional(),
  category_id: z.string().optional(),
  shift_id: z.string().optional(),
  join_date: z.string().min(1, "Join date is required"),
  employee_type: z.enum(["permanent", "contractual", "part_time", "intern", "consultant"]).optional(),
  employment_status: z.enum(["active", "on_leave", "suspended", "terminated", "resigned"]).optional(),
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  account_title: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relation: z.string().optional(),
  notes: z.string().optional(),
  // Doctor fields
  specialization: z.string().optional(),
  qualification: z.string().optional(),
  license_number: z.string().optional(),
  consultation_fee: z.number().optional().nullable(),
  default_surgery_fee: z.number().optional().nullable(),
  ipd_visit_fee: z.number().optional().nullable(),
  is_available: z.boolean().optional(),
  // Compensation fields
  compensation_plan_type: z.enum(["fixed_salary", "per_consultation", "per_procedure", "revenue_share", "hybrid"]).optional(),
  consultation_share_percent: z.number().min(0).max(100).optional().nullable(),
  procedure_share_percent: z.number().min(0).max(100).optional().nullable(),
  surgery_share_percent: z.number().min(0).max(100).optional().nullable(),
  anesthesia_share_percent: z.number().min(0).max(100).optional().nullable(),
  ipd_visit_share_percent: z.number().min(0).max(100).optional().nullable(),
  lab_referral_percent: z.number().min(0).max(100).optional().nullable(),
  radiology_referral_percent: z.number().min(0).max(100).optional().nullable(),
  minimum_guarantee: z.number().optional().nullable(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

// Categories that should show the clinical tab
const DOCTOR_CATEGORIES = ["doctor", "physician", "consultant", "specialist"];
const NURSE_CATEGORIES = ["nurse", "nursing", "rn", "lpn", "head nurse", "charge nurse"];

export default function EmployeeFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { profile } = useAuth();
  const isEditing = !!id;
  
  // Get pre-selected category from URL params (e.g., ?category=nurse)
  const preselectedCategory = searchParams.get("category");

  // Login account state
  const [createLogin, setCreateLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  
  // Documents state
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);

  const { data: employee, isLoading: loadingEmployee } = useEmployee(id || "");
  const { data: doctorData, isLoading: loadingDoctor } = useDoctorByEmployeeId(id || "");
  const { data: nurseData, isLoading: loadingNurse } = useNurseByEmployeeId(id || "");
  const { data: branches } = useBranches();
  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();
  const { data: categories } = useEmployeeCategories();
  const { data: shifts } = useShifts();
  const countryConfig = useCountryConfig();

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const createDoctorForEmployee = useCreateDoctorForEmployee();
  const createNurseForEmployee = useCreateNurseForEmployee();
  const createStaffUser = useCreateStaffUser();
  const createEmployeeDocument = useCreateEmployeeDocument();

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employee_number: "",
      first_name: "",
      last_name: "",
      join_date: new Date().toISOString().split("T")[0],
      employee_type: "permanent",
      employment_status: "active",
      is_available: true,
    },
  });

  const watchCategoryId = form.watch("category_id");
  
  // Check if selected category is a doctor or nurse category
  const selectedCategory = categories?.find(c => c.id === watchCategoryId);
  
  const isDoctorCategory = selectedCategory 
    ? DOCTOR_CATEGORIES.some(cc => 
        selectedCategory.name.toLowerCase().includes(cc) ||
        selectedCategory.code?.toLowerCase().includes(cc)
      )
    : false;
    
  const isNurseCategory = selectedCategory 
    ? NURSE_CATEGORIES.some(cc => 
        selectedCategory.name.toLowerCase().includes(cc) ||
        selectedCategory.code?.toLowerCase().includes(cc)
      )
    : false;
    
  const isClinicalCategory = isDoctorCategory || isNurseCategory;
  
  // Pre-select nurse category when coming from nurses list
  useEffect(() => {
    if (preselectedCategory === "nurse" && categories && !form.getValues("category_id")) {
      const nurseCategory = categories.find(c => 
        NURSE_CATEGORIES.some(nc => 
          c.name.toLowerCase().includes(nc) || c.code?.toLowerCase().includes(nc)
        )
      );
      if (nurseCategory) {
        form.setValue("category_id", nurseCategory.id);
      }
    }
  }, [categories, preselectedCategory, form]);

  useEffect(() => {
    if (employee) {
      form.reset({
        employee_number: employee.employee_number,
        first_name: employee.first_name,
        last_name: employee.last_name || "",
        gender: employee.gender as any,
        date_of_birth: employee.date_of_birth || "",
        personal_phone: employee.personal_phone || "",
        personal_email: employee.personal_email || "",
        national_id: employee.national_id || "",
        current_address: employee.current_address || "",
        permanent_address: employee.permanent_address || "",
        branch_id: employee.branch_id || "",
        department_id: employee.department_id || "",
        designation_id: employee.designation_id || "",
        category_id: employee.category_id || "",
        shift_id: employee.shift_id || "",
        join_date: employee.join_date,
        employee_type: employee.employee_type as any,
        employment_status: employee.employment_status as any,
        bank_name: employee.bank_name || "",
        account_number: employee.account_number || "",
        account_title: employee.account_title || "",
        emergency_contact_name: employee.emergency_contact_name || "",
        emergency_contact_phone: employee.emergency_contact_phone || "",
        emergency_contact_relation: employee.emergency_contact_relation || "",
        notes: employee.notes || "",
        // Doctor fields
        specialization: doctorData?.specialization || "",
        qualification: doctorData?.qualification || "",
        license_number: doctorData?.license_number || "",
        consultation_fee: doctorData?.consultation_fee || undefined,
        default_surgery_fee: (doctorData as any)?.default_surgery_fee || undefined,
        ipd_visit_fee: (doctorData as any)?.ipd_visit_fee || undefined,
        is_available: doctorData?.is_available ?? true,
      });
    }
  }, [employee, doctorData, form]);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      if (!profile?.organization_id) {
        toast({ title: "Organization not found", variant: "destructive" });
        return;
      }

      let employeeId = id;
      
      if (isEditing && id) {
        // Editing existing employee - use standard update
        await updateEmployee.mutateAsync({ 
          id, 
          employee_number: data.employee_number,
          first_name: data.first_name,
          last_name: data.last_name || null,
          gender: data.gender as any || null,
          date_of_birth: data.date_of_birth || null,
          personal_phone: data.personal_phone || null,
          personal_email: data.personal_email || null,
          national_id: data.national_id || null,
          current_address: data.current_address || null,
          permanent_address: data.permanent_address || null,
          branch_id: data.branch_id || null,
          department_id: data.department_id || null,
          designation_id: data.designation_id || null,
          category_id: data.category_id || null,
          shift_id: data.shift_id || null,
          join_date: data.join_date,
          employee_type: data.employee_type as any || null,
          employment_status: data.employment_status as any || null,
          bank_name: data.bank_name || null,
          account_number: data.account_number || null,
          account_title: data.account_title || null,
          emergency_contact_name: data.emergency_contact_name || null,
          emergency_contact_phone: data.emergency_contact_phone || null,
          emergency_contact_relation: data.emergency_contact_relation || null,
          notes: data.notes || null,
        });
      } else if (createLogin && loginEmail && loginPassword) {
        // Creating new employee WITH login account - use edge function
        const result = await createStaffUser.mutateAsync({
          email: loginEmail,
          password: loginPassword,
          first_name: data.first_name,
          last_name: data.last_name || undefined,
          phone: data.personal_phone || undefined,
          gender: data.gender || undefined,
          date_of_birth: data.date_of_birth || undefined,
          organization_id: profile.organization_id,
          branch_id: data.branch_id || undefined,
          department_id: data.department_id || undefined,
          designation_id: data.designation_id || undefined,
          category_id: data.category_id || undefined,
          roles: selectedRoles.length > 0 ? selectedRoles : undefined,
          join_date: data.join_date || undefined,
          shift_id: data.shift_id || undefined,
          specialization_id: isDoctorCategory ? data.specialization : undefined,
          qualification: isDoctorCategory ? data.qualification : undefined,
          license_number: isDoctorCategory ? data.license_number : undefined,
          consultation_fee: isDoctorCategory ? data.consultation_fee : undefined,
        });
        employeeId = result.employee_id;
      } else {
        // Creating new employee WITHOUT login account - use standard insert
        const newEmployee = await createEmployee.mutateAsync({
          organization_id: profile.organization_id,
          employee_number: data.employee_number,
          first_name: data.first_name,
          last_name: data.last_name || null,
          gender: data.gender as any || null,
          date_of_birth: data.date_of_birth || null,
          personal_phone: data.personal_phone || null,
          personal_email: data.personal_email || null,
          national_id: data.national_id || null,
          current_address: data.current_address || null,
          permanent_address: data.permanent_address || null,
          branch_id: data.branch_id || null,
          department_id: data.department_id || null,
          designation_id: data.designation_id || null,
          category_id: data.category_id || null,
          shift_id: data.shift_id || null,
          join_date: data.join_date,
          employee_type: data.employee_type as any || null,
          employment_status: data.employment_status as any || null,
          bank_name: data.bank_name || null,
          account_number: data.account_number || null,
          account_title: data.account_title || null,
          emergency_contact_name: data.emergency_contact_name || null,
          emergency_contact_phone: data.emergency_contact_phone || null,
          emergency_contact_relation: data.emergency_contact_relation || null,
          notes: data.notes || null,
        });
        employeeId = newEmployee.id;
      }

      // Save doctor details if this is a clinical category and we didn't use edge function
      let doctorRecordId = doctorData?.id;
      if (!createLogin && isClinicalCategory && employeeId && (data.specialization || data.qualification || data.license_number)) {
        const createdDoctor = await createDoctorForEmployee.mutateAsync({
          employeeId,
          branchId: data.branch_id || undefined,
          specialization: data.specialization || undefined,
          qualification: data.qualification || undefined,
          licenseNumber: data.license_number || undefined,
          consultationFee: data.consultation_fee,
          isAvailable: data.is_available ?? true,
        });
        doctorRecordId = createdDoctor?.id;
      }

      // Save compensation plan if this is a doctor category and we have compensation data
      if (isDoctorCategory && doctorRecordId && data.compensation_plan_type) {
        // First, update the doctor record with fee fields
        await supabase
          .from("doctors")
          .update({
            consultation_fee: data.consultation_fee ?? null,
            default_surgery_fee: data.default_surgery_fee ?? null,
            ipd_visit_fee: data.ipd_visit_fee ?? null,
          })
          .eq("id", doctorRecordId);

        // Check if plan exists
        const { data: existingPlan } = await supabase
          .from("doctor_compensation_plans")
          .select("id")
          .eq("doctor_id", doctorRecordId)
          .eq("is_active", true)
          .maybeSingle();

        const planData = {
          doctor_id: doctorRecordId,
          plan_type: data.compensation_plan_type,
          consultation_share_percent: data.consultation_share_percent ?? 50,
          procedure_share_percent: data.procedure_share_percent ?? 50,
          surgery_share_percent: data.surgery_share_percent ?? 50,
          anesthesia_share_percent: data.anesthesia_share_percent ?? 50,
          ipd_visit_share_percent: data.ipd_visit_share_percent ?? 50,
          lab_referral_percent: data.lab_referral_percent ?? 10,
          radiology_referral_percent: data.radiology_referral_percent ?? 10,
          minimum_guarantee: data.minimum_guarantee ?? 0,
          base_salary: 0,
          effective_from: new Date().toISOString().split("T")[0],
          is_active: true,
          organization_id: profile.organization_id,
        };

        if (existingPlan) {
          await supabase
            .from("doctor_compensation_plans")
            .update({
              ...planData,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingPlan.id);
        } else {
          await supabase
            .from("doctor_compensation_plans")
            .insert(planData);
        }
      }

      // Upload and save pending documents
      if (employeeId && pendingDocuments.length > 0) {
        for (const doc of pendingDocuments) {
          let fileUrl = "";
          
          // Upload file if attached
          if (doc.file) {
            const fileExt = doc.file.name.split(".").pop();
            const fileName = `${employeeId}/${Date.now()}-${doc.document_type}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from("employee-documents")
              .upload(fileName, doc.file);
            
            if (uploadError) {
              console.error("Failed to upload document:", uploadError);
              continue;
            }
            
            const { data: urlData } = supabase.storage
              .from("employee-documents")
              .getPublicUrl(fileName);
            
            fileUrl = urlData.publicUrl;
          }
          
          // Save document record
          await createEmployeeDocument.mutateAsync({
            employee_id: employeeId,
            document_name: doc.document_name,
            document_type: doc.document_type,
            document_category: doc.document_category as "education" | "employment" | "identity" | "legal" | "medical" | "other" | undefined,
            document_number: doc.document_number,
            expiry_date: doc.expiry_date,
            file_url: fileUrl || `placeholder-${doc.document_type}`,
          });
        }
      }

      toast({ title: isEditing ? "Employee updated successfully" : "Employee created successfully" });
      navigate("/app/hr/employees");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save employee",
        variant: "destructive",
      });
    }
  };

  if (isEditing && (loadingEmployee || loadingDoctor || loadingNurse)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? "Edit Employee" : "Add New Employee"}
        description={isEditing ? "Update employee information" : "Register a new staff member"}
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Employees", href: "/app/hr/employees" },
          { label: isEditing ? "Edit" : "New" },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/hr/employees")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Login Account Section - only for new employees */}
          {!isEditing && (
            <LoginAccountSection
              enabled={createLogin}
              onEnabledChange={setCreateLogin}
              email={loginEmail}
              onEmailChange={setLoginEmail}
              password={loginPassword}
              onPasswordChange={setLoginPassword}
              selectedRoles={selectedRoles}
              onRolesChange={setSelectedRoles}
            />
          )}

          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList className={`grid w-full ${isDoctorCategory ? 'grid-cols-8' : isClinicalCategory ? 'grid-cols-7' : 'grid-cols-6'}`}>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="bank">Bank</TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
              {isDoctorCategory && (
                <TabsTrigger value="clinical" className="flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4" />
                  Clinical
                </TabsTrigger>
              )}
              {isNurseCategory && (
                <TabsTrigger value="clinical" className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4" />
                  Nursing
                </TabsTrigger>
              )}
              {isDoctorCategory && (
                <TabsTrigger value="compensation" className="flex items-center gap-1.5">
                  <Wallet className="h-4 w-4" />
                  Compensation
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="employee_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="EMP001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="national_id"
                    render={({ field }) => {
                      const val = field.value || '';
                      const isSA = countryConfig.country_code === 'SA';
                      const showError = isSA && val.length > 0 && !isValidSaudiId(val);
                      return (
                        <FormItem>
                          <FormLabel>{countryConfig.national_id_label}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={isSA ? t('saudiId.placeholder') : countryConfig.national_id_format}
                              {...field}
                              maxLength={isSA ? 10 : undefined}
                            />
                          </FormControl>
                          {showError && (
                            <p className="text-sm text-destructive">{t('saudiId.invalidFormat')}</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="employment">
              <Card>
                <CardHeader>
                  <CardTitle>Employment Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="branch_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {branches?.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments?.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="designation_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select designation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {designations?.map((desg) => (
                              <SelectItem key={desg.id} value={desg.id}>
                                {desg.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shift_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shift</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select shift" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {shifts?.map((shift) => (
                              <SelectItem key={shift.id} value={shift.id}>
                                {shift.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="join_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Join Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employee_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="permanent">Permanent</SelectItem>
                            <SelectItem value="contractual">Contractual</SelectItem>
                            <SelectItem value="part_time">Part Time</SelectItem>
                            <SelectItem value="intern">Intern</SelectItem>
                            <SelectItem value="consultant">Consultant</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employment_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="on_leave">On Leave</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="terminated">Terminated</SelectItem>
                            <SelectItem value="resigned">Resigned</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="personal_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+92 300 1234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="personal_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="current_address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Current Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter current address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="permanent_address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Permanent Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter permanent address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bank">
              <Card>
                <CardHeader>
                  <CardTitle>Bank Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="HBL, UBL, MCB..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="account_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Title</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="emergency">
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="emergency_contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergency_contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+92 300 1234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergency_contact_relation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <FormControl>
                          <Input placeholder="Spouse, Parent, Sibling..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <DocumentUploadSection
                pendingDocuments={pendingDocuments}
                onDocumentsChange={setPendingDocuments}
                disabled={isEditing}
              />
            </TabsContent>

            {isDoctorCategory && (
              <TabsContent value="clinical">
                <DoctorDetailsForm form={form} />
              </TabsContent>
            )}
            
            {isNurseCategory && (
              <TabsContent value="clinical">
                <NurseDetailsForm form={form} />
              </TabsContent>
            )}

            {isDoctorCategory && (
              <TabsContent value="compensation">
                <DoctorCompensationForm 
                  form={form} 
                  doctorId={doctorData?.id}
                  isSurgeon={selectedCategory?.name?.toLowerCase().includes('surgeon')}
                  isAnesthetist={selectedCategory?.name?.toLowerCase().includes('anesthes')}
                />
              </TabsContent>
            )}
          </Tabs>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/app/hr/employees")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createEmployee.isPending || updateEmployee.isPending || createDoctorForEmployee.isPending || createStaffUser.isPending}
            >
              {(createEmployee.isPending || updateEmployee.isPending || createDoctorForEmployee.isPending || createStaffUser.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Update Employee" : "Create Employee"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

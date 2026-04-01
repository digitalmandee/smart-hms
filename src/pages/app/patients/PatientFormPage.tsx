import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { usePatientConfig } from "@/hooks/usePatientConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePatient, useCreatePatient, useUpdatePatient } from "@/hooks/usePatients";
import { useBranches } from "@/hooks/useBranches";
import { 
  Loader2, User, Phone, MapPin, Heart, AlertCircle, Shield, 
  Briefcase, Users, ChevronDown, Printer
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePrint } from "@/hooks/usePrint";
import { PrintablePatientCard } from "@/components/patients/PrintablePatientCard";
import { useOrganization } from "@/hooks/useOrganizations";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { useTranslation } from "@/lib/i18n";
import { isValidSaudiId, getSaudiIdType } from "@/lib/validations/saudiId";

const patientSchema = z.object({
  // Personal Information
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().optional(),
  father_husband_name: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(["male", "female", "other", "child"]).optional(),
  marital_status: z.enum(["single", "married", "divorced", "widowed", "other"]).optional(),
  number_of_children: z.string().optional(),
  blood_group: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  occupation: z.string().optional(),
  preferred_language: z.string().optional(),
  
  // Identity Documents — Saudi ID validated dynamically via superRefine
  national_id: z.string().optional(),
  passport_number: z.string().optional(),
  
  // Contact Information
  phone: z.string().optional(),
  secondary_phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  
  // Address
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  
  // Emergency Contact
  emergency_contact_name: z.string().optional(),
  emergency_contact_relation: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  
  // Guardian (for child patients)
  guardian_name: z.string().optional(),
  guardian_phone: z.string().optional(),
  guardian_relation: z.string().optional(),
  
  // Insurance
  insurance_provider: z.string().optional(),
  insurance_id: z.string().optional(),
  
  // Referral
  referred_by: z.string().optional(),
  referral_details: z.string().optional(),
  
  // Additional
  notes: z.string().optional(),
  branch_id: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function PatientFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const isEditing = !!id;
  const [showAllFields, setShowAllFields] = useState(false);
  const [printCardAfterSave, setPrintCardAfterSave] = useState(false);
  const [savedPatient, setSavedPatient] = useState<any>(null);

  // Dynamic configuration data
  const countryConfig = useCountryConfig();
  const { cities, languages, occupations, relations, referralSources, insuranceProviders } = usePatientConfig();

  const { data: patient, isLoading: patientLoading } = usePatient(id);
  const { data: branches } = useBranches();
  const { data: organization } = useOrganization(profile?.organization_id ?? undefined);
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const { printRef, handlePrint } = usePrint();

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      father_husband_name: "",
      date_of_birth: "",
      gender: undefined,
      marital_status: undefined,
      number_of_children: "",
      blood_group: "",
      nationality: "Pakistan",
      religion: "",
      occupation: "",
      preferred_language: "Urdu",
      national_id: "",
      passport_number: "",
      phone: "",
      secondary_phone: "",
      email: "",
      address: "",
      city: "",
      postal_code: "",
      emergency_contact_name: "",
      emergency_contact_relation: "",
      emergency_contact_phone: "",
      insurance_provider: "",
      insurance_id: "",
      referred_by: "",
      referral_details: "",
      notes: "",
      branch_id: "",
    },
  });

  const maritalStatus = form.watch("marital_status");

  useEffect(() => {
    if (patient) {
      setShowAllFields(true);
      form.reset({
        first_name: patient.first_name,
        last_name: patient.last_name || "",
        father_husband_name: (patient as any).father_husband_name || "",
        date_of_birth: patient.date_of_birth || "",
        gender: (patient.gender as any) || undefined,
        marital_status: (patient as any).marital_status || undefined,
        number_of_children: String((patient as any).number_of_children || ""),
        blood_group: patient.blood_group || "",
        nationality: (patient as any).nationality || "Pakistan",
        religion: (patient as any).religion || "",
        occupation: (patient as any).occupation || "",
        preferred_language: (patient as any).preferred_language || "Urdu",
        national_id: patient.national_id || "",
        passport_number: (patient as any).passport_number || "",
        phone: patient.phone || "",
        secondary_phone: (patient as any).secondary_phone || "",
        email: patient.email || "",
        address: patient.address || "",
        city: patient.city || "",
        postal_code: patient.postal_code || "",
        emergency_contact_name: patient.emergency_contact_name || "",
        emergency_contact_relation: (patient as any).emergency_contact_relation || "",
        emergency_contact_phone: patient.emergency_contact_phone || "",
        insurance_provider: (patient as any).insurance_provider || "",
        insurance_id: (patient as any).insurance_id || "",
        referred_by: (patient as any).referred_by || "",
        referral_details: (patient as any).referral_details || "",
        notes: patient.notes || "",
        branch_id: patient.branch_id || "",
      });
    }
  }, [patient, form]);

  const onSubmit = async (data: PatientFormData) => {
    try {
      const payload: any = {
        first_name: data.first_name,
        last_name: data.last_name || null,
        father_husband_name: data.father_husband_name || null,
        date_of_birth: data.date_of_birth || null,
        gender: data.gender || null,
        marital_status: data.marital_status || null,
        number_of_children: data.number_of_children ? parseInt(data.number_of_children) : null,
        blood_group: data.blood_group || null,
        nationality: data.nationality || null,
        religion: data.religion || null,
        occupation: data.occupation || null,
        preferred_language: data.preferred_language || null,
        national_id: data.national_id || null,
        passport_number: data.passport_number || null,
        phone: data.phone || null,
        secondary_phone: data.secondary_phone || null,
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        postal_code: data.postal_code || null,
        emergency_contact_name: data.emergency_contact_name || null,
        emergency_contact_relation: data.emergency_contact_relation || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
        insurance_provider: data.insurance_provider || null,
        insurance_id: data.insurance_id || null,
        referred_by: data.referred_by || null,
        referral_details: data.referral_details || null,
        notes: data.notes || null,
        guardian_name: data.guardian_name || null,
        guardian_phone: data.guardian_phone || null,
        guardian_relation: data.guardian_relation || null,
        branch_id: data.branch_id || null,
      };

      if (isEditing && id) {
        const result = await updatePatient.mutateAsync({ id, data: payload });
        if (printCardAfterSave) {
          setSavedPatient(result);
          setTimeout(() => handlePrint(), 300);
        }
        navigate(`/app/patients/${id}`);
      } else {
        const newPatient = await createPatient.mutateAsync(payload);
        if (printCardAfterSave) {
          setSavedPatient(newPatient);
          setTimeout(() => handlePrint(), 300);
        }
        navigate(`/app/patients/${newPatient.id}`);
      }
    } catch (error) {
      // Error handled by hooks
    }
  };

  if (isEditing && patientLoading) {
    return (
      <div>
        <PageHeader
          title={t('patient.editPatient')}
          breadcrumbs={[
            { label: t('nav.patients'), href: "/app/patients" },
            { label: t('patient.edit') },
          ]}
        />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPending = createPatient.isPending || updatePatient.isPending;

  // Calculate form completion for visual indicator
  const filledFields = Object.values(form.watch()).filter(v => v && v !== "").length;
  const totalFields = Object.keys(form.getValues()).length;
  const completionPercent = Math.round((filledFields / totalFields) * 100);

  return (
    <div>
      <PageHeader
        title={isEditing ? t('patient.editPatient') : t('patient.newPatient')}
        description={isEditing ? `${t('patient.editPatient')}: ${patient?.first_name} ${patient?.last_name || ""}` : t('patient.fillDetails')}
        breadcrumbs={[
          { label: t('nav.patients'), href: "/app/patients" },
          { label: isEditing ? t('patient.edit') : t('patient.new') },
        ]}
        actions={
          <Badge variant="secondary" className="text-sm">
            {completionPercent}% Complete
          </Badge>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Quick Registration - Essential Fields */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {t('patient.patientInformation')}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllFields(!showAllFields)}
                  className="text-muted-foreground"
                >
                  {showAllFields ? t('patient.showLess') : t('patient.showMore')}
                  <ChevronDown className={cn(
                    "h-4 w-4 ms-1 transition-transform",
                    showAllFields && "rotate-180"
                  )} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Essential Fields - Always Visible */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('patient.firstName')} <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('patient.firstName')} className="h-11" />
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
                      <FormLabel>{t('patient.lastName')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('patient.lastName')} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('patient.phone')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="03XX-XXXXXXX" className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="national_id"
                  render={({ field }) => {
                    const cc = countryConfig;
                    const isSA = cc.country_code === 'SA';
                    const val = field.value || '';
                    const showError = isSA && val.length > 0 && !isValidSaudiId(val);
                    const idType = isSA && val.length === 10 ? getSaudiIdType(val) : null;
                    return (
                      <FormItem>
                        <FormLabel>{cc.national_id_label}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={isSA ? t('saudiId.placeholder') : cc.national_id_format}
                            className="h-11"
                            maxLength={isSA ? 10 : undefined}
                          />
                        </FormControl>
                        {showError && (
                          <p className="text-sm text-destructive">{t('saudiId.invalidFormat')}</p>
                        )}
                        {idType === 'saudi' && (
                          <p className="text-xs text-muted-foreground">{t('saudiId.saudiNational')}</p>
                        )}
                        {idType === 'iqama' && (
                          <p className="text-xs text-muted-foreground">{t('saudiId.iqamaResident')}</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('patient.gender')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder={t('patient.gender')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">{t('patient.male')}</SelectItem>
                          <SelectItem value="female">{t('patient.female')}</SelectItem>
                          <SelectItem value="child">{t('gender.child')}</SelectItem>
                          <SelectItem value="other">{t('patient.other')}</SelectItem>
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
                      <FormLabel>{t('patient.dateOfBirth')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="blood_group"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('patient.bloodGroup')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder={t('patient.bloodGroup')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BLOOD_GROUPS.map((bg) => (
                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('patient.city')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder={t('patient.city')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(cities.data || []).map((city) => (
                            <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Guardian Fields - shown when gender is child */}
              {form.watch("gender") === "child" && (
                <div className="p-4 border border-primary/20 rounded-lg bg-primary/5 space-y-4">
                  <p className="text-sm font-semibold text-primary">{t('gender.child')} — Guardian Details</p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="guardian_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.guardianName')} <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t('patient.guardianName')} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="guardian_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.guardianPhone')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="03XX-XXXXXXX" className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="guardian_relation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.guardianRelation')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder={t('patient.guardianRelation')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="father">Father</SelectItem>
                              <SelectItem value="mother">Mother</SelectItem>
                              <SelectItem value="grandparent">Grandparent</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extended Fields - Collapsible Sections */}
          {showAllFields && (
            <Accordion type="multiple" defaultValue={["personal", "emergency"]} className="space-y-4">
              {/* Personal Details */}
              <AccordionItem value="personal" className="border rounded-lg bg-card">
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{t('patient.personalDetails')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="father_husband_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.fatherHusbandName')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t('patient.fatherHusbandName')} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="marital_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.maritalStatus')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('patient.maritalStatus')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="single">{t('patient.single')}</SelectItem>
                              <SelectItem value="married">{t('patient.married')}</SelectItem>
                              <SelectItem value="divorced">{t('patient.divorced')}</SelectItem>
                              <SelectItem value="widowed">{t('patient.widowed')}</SelectItem>
                              <SelectItem value="other">{t('patient.other')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {maritalStatus === "married" && (
                      <FormField
                        control={form.control}
                        name="number_of_children"
                        render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.numberOfChildren')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" max="20" placeholder="0" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.nationality')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Pakistan" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="religion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.religion')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Optional" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.occupation')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('patient.occupation')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(occupations.data || []).map((occ) => (
                                <SelectItem key={occ.id} value={occ.name}>{occ.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferred_language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.language')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('patient.language')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(languages.data || []).map((lang) => (
                                <SelectItem key={lang.id} value={lang.name}>{lang.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="passport_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.passportNumber')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Optional" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Contact Information */}
              <AccordionItem value="contact" className="border rounded-lg bg-card">
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{t('patient.contactInformation')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="secondary_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.secondaryPhone')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Alternative number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="patient@email.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Address */}
              <AccordionItem value="address" className="border rounded-lg bg-card">
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{t('patient.address')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.streetAddress')}</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="House/Street address" rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="postal_code"
                        render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.postalCode')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="54000" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Emergency Contact */}
              <AccordionItem value="emergency" className="border rounded-lg bg-card">
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <span className="font-semibold">{t('patient.emergencyContact')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="emergency_contact_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.emergencyContactName')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Emergency contact name" />
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
                          <FormLabel>{t('patient.emergencyRelation')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('patient.emergencyRelation')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(relations.data || []).map((rel) => (
                                <SelectItem key={rel.id} value={rel.name}>{rel.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergency_contact_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.emergencyPhone')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="03XX-XXXXXXX" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Insurance */}
              <AccordionItem value="insurance" className="border rounded-lg bg-card">
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{t('patient.insuranceSection')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="insurance_provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.insuranceProvider')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('patient.insuranceProvider')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(insuranceProviders.data || []).map((ins) => (
                                <SelectItem key={ins.id} value={ins.name}>{ins.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="insurance_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.insuranceId')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Insurance ID number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Referral */}
              <AccordionItem value="referral" className="border rounded-lg bg-card">
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{t('patient.referral')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="referred_by"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.referredBy')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('patient.referredBy')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(referralSources.data || []).map((ref) => (
                                <SelectItem key={ref.id} value={ref.name}>{ref.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="referral_details"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.referralDetails')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Doctor/Hospital name if applicable" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Additional Info */}
              <AccordionItem value="additional" className="border rounded-lg bg-card">
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{t('patient.additionalNotes')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="branch_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('patient.branch')}</FormLabel>
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
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common.notes')}</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Any additional notes about the patient..." rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Actions - Sticky on mobile */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t sticky bottom-0 bg-background py-4 -mx-4 px-4 md:mx-0 md:px-0 md:relative md:py-4 md:bottom-auto">
            <div className="flex items-center gap-2 order-2 md:order-1">
              <Checkbox
                id="printCard"
                checked={printCardAfterSave}
                onCheckedChange={(checked) => setPrintCardAfterSave(checked === true)}
              />
              <label htmlFor="printCard" className="text-sm text-muted-foreground cursor-pointer">
                Print patient ID card after saving
              </label>
            </div>
            
            <div className="flex gap-3 order-1 md:order-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/app/patients")}
                className="flex-1 md:flex-none h-12 md:h-10"
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1 md:flex-none min-w-[140px] h-12 md:h-10">
                {isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {isEditing ? t('patient.saveChanges') : t('patient.registerNew')}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Printable Patient Card */}
      <div className="hidden">
        <PrintablePatientCard
          ref={printRef}
          patient={savedPatient || patient || { id: '', patient_number: '', first_name: '' }}
          organization={organization ? { 
            name: organization.name, 
            phone: organization.phone, 
            address: organization.address,
            city: organization.city 
          } : undefined}
        />
      </div>
    </div>
  );
}

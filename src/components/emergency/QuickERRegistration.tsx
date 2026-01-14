import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientSearch } from "@/components/appointments/PatientSearch";
import { useCreateEmergencyRegistration, ARRIVAL_MODES, ArrivalMode } from "@/hooks/useEmergency";
import { Loader2, UserPlus, Search, AlertTriangle, Shield, Ambulance } from "lucide-react";
import { useNavigate } from "react-router-dom";

const registrationSchema = z.object({
  arrival_mode: z.string().min(1, "Arrival mode is required"),
  chief_complaint: z.string().min(1, "Chief complaint is required"),
  is_trauma: z.boolean().default(false),
  is_mlc: z.boolean().default(false),
  police_station: z.string().optional(),
  fir_number: z.string().optional(),
  brought_by_name: z.string().optional(),
  brought_by_phone: z.string().optional(),
  brought_by_relation: z.string().optional(),
  mechanism_of_injury: z.string().optional(),
  // Unknown patient fields
  unknown_estimated_age: z.string().optional(),
  unknown_gender: z.string().optional(),
  unknown_features: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface QuickERRegistrationProps {
  onSuccess?: (id: string) => void;
  ambulanceAlertId?: string;
  prefillData?: {
    arrival_mode?: ArrivalMode;
    condition_summary?: string;
  };
}

export const QuickERRegistration = ({
  onSuccess,
  ambulanceAlertId,
  prefillData,
}: QuickERRegistrationProps) => {
  const [patientMode, setPatientMode] = useState<"search" | "unknown">("search");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const createMutation = useCreateEmergencyRegistration();
  const navigate = useNavigate();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      arrival_mode: prefillData?.arrival_mode || "walk_in",
      chief_complaint: prefillData?.condition_summary || "",
      is_trauma: false,
      is_mlc: false,
      police_station: "",
      fir_number: "",
      brought_by_name: "",
      brought_by_phone: "",
      brought_by_relation: "",
      mechanism_of_injury: "",
      unknown_estimated_age: "",
      unknown_gender: "",
      unknown_features: "",
    },
  });

  const isMLC = form.watch("is_mlc");
  const isTrauma = form.watch("is_trauma");
  const arrivalMode = form.watch("arrival_mode");

  const onSubmit = async (data: RegistrationFormData) => {
    const payload: any = {
      patient_id: selectedPatientId,
      arrival_mode: data.arrival_mode as ArrivalMode,
      chief_complaint: data.chief_complaint,
      is_trauma: data.is_trauma,
      is_mlc: data.is_mlc,
      mechanism_of_injury: data.mechanism_of_injury || null,
      police_station: data.is_mlc ? data.police_station : null,
      fir_number: data.is_mlc ? data.fir_number : null,
      brought_by_name: data.brought_by_name || null,
      brought_by_phone: data.brought_by_phone || null,
      brought_by_relation: data.brought_by_relation || null,
    };

    // If unknown patient, store details
    if (patientMode === "unknown") {
      payload.unknown_patient_details = {
        estimated_age: data.unknown_estimated_age,
        gender: data.unknown_gender,
        distinguishing_features: data.unknown_features,
      };
    }

    const result = await createMutation.mutateAsync(payload);
    if (result && onSuccess) {
      onSuccess(result.id);
    } else if (result) {
      navigate(`/app/emergency/${result.id}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Patient Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={patientMode} onValueChange={(v) => setPatientMode(v as "search" | "unknown")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Existing Patient
                </TabsTrigger>
                <TabsTrigger value="unknown" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Unknown Patient
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="mt-4">
                <PatientSearch
                  onSelect={(patient) => {
                    setSelectedPatientId(patient.id);
                    setSelectedPatient(patient);
                  }}
                />
                {selectedPatient && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="font-medium">
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedPatient.patient_number} • {selectedPatient.phone}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unknown" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="unknown_estimated_age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Age</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="~30 years" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unknown_gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="unknown_features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distinguishing Features</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Tattoos, scars, clothing description, etc."
                          rows={2}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Arrival & Complaint */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Arrival Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="arrival_mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arrival Mode *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select arrival mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ARRIVAL_MODES.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {arrivalMode === "brought_by_family" && (
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="brought_by_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brought By</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Name" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {arrivalMode === "brought_by_family" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brought_by_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Phone number" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brought_by_relation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relation</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Relation to patient" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="chief_complaint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chief Complaint *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the main presenting complaint..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Trauma & MLC Flags */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Case Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-3">
                <Switch
                  id="is_trauma"
                  checked={isTrauma}
                  onCheckedChange={(checked) => form.setValue("is_trauma", checked)}
                />
                <Label htmlFor="is_trauma" className="flex items-center gap-2 cursor-pointer">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Trauma Case
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  id="is_mlc"
                  checked={isMLC}
                  onCheckedChange={(checked) => form.setValue("is_mlc", checked)}
                />
                <Label htmlFor="is_mlc" className="flex items-center gap-2 cursor-pointer">
                  <Shield className="h-4 w-4 text-red-500" />
                  Medico-Legal Case (MLC)
                </Label>
              </div>
            </div>

            {isTrauma && (
              <FormField
                control={form.control}
                name="mechanism_of_injury"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mechanism of Injury</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="How did the injury occur? (e.g., RTA, fall from height, assault)"
                        rows={2}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {isMLC && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                <FormField
                  control={form.control}
                  name="police_station"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Police Station</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Station name" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fir_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>FIR Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="FIR/DD number" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/app/emergency")}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Register Emergency Patient
          </Button>
        </div>
      </form>
    </Form>
  );
};

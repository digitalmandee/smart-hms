import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BirthRecordForm } from "@/components/ipd/BirthRecordForm";
import { useCreateBirthRecord } from "@/hooks/useBirthRecords";
import { usePatient, useCreatePatient } from "@/hooks/usePatients";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Search, User, Baby } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function BirthRecordFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();
  const { mutate: createBirthRecord, isPending } = useCreateBirthRecord();
  const { mutate: createPatient } = useCreatePatient();
  
  const [selectedMotherId, setSelectedMotherId] = useState<string>(searchParams.get('motherId') || '');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [createBabyRecord, setCreateBabyRecord] = useState(true);
  
  const { data: selectedMother } = usePatient(selectedMotherId);

  // Fetch doctors
  const { data: doctors } = useQuery({
    queryKey: ['doctors', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, profiles(full_name)')
        .eq('organization_id', profile?.organization_id!);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Search patients (female only for mothers)
  const { data: searchResults } = useQuery({
    queryKey: ['patient-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, patient_number, phone, gender')
        .eq('organization_id', profile?.organization_id!)
        .eq('gender', 'female')
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,patient_number.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: searchQuery.length >= 2,
  });

  // Check for active admission for mother
  const { data: activeAdmission } = useQuery({
    queryKey: ['active-admission', selectedMotherId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admissions')
        .select('id, admission_number, bed:beds(bed_number, ward:wards(name))')
        .eq('patient_id', selectedMotherId)
        .eq('status', 'admitted')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!selectedMotherId,
  });

  const handleSubmit = async (data: any) => {
    try {
      let babyPatientId: string | undefined;

      // Create baby patient record if checkbox is checked
      if (createBabyRecord && selectedMother) {
        const babyName = `Baby of ${selectedMother.first_name} ${selectedMother.last_name}`;
        
        // Create baby patient record
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert([{
            organization_id: profile?.organization_id,
            branch_id: profile?.branch_id,
            first_name: babyName,
            last_name: '',
            gender: data.gender || 'unknown',
            date_of_birth: data.birth_date,
            phone: selectedMother.phone,
            address: selectedMother.address,
            city: selectedMother.city,
            notes: `Baby born to ${selectedMother.first_name} ${selectedMother.last_name} (${selectedMother.patient_number})`,
          }])
          .select('id')
          .single();

        if (patientError) {
          toast.error('Failed to create baby patient record');
          console.error(patientError);
          return;
        }

        babyPatientId = newPatient.id;
        toast.success(`Baby patient record created: ${babyName}`);
      }

      // Create birth record
      createBirthRecord({
        ...data,
        baby_patient_id: babyPatientId,
        admission_id: activeAdmission?.id,
      }, {
        onSuccess: () => {
          navigate('/app/ipd/births');
        },
      });
    } catch (error) {
      console.error('Error creating birth record:', error);
      toast.error('Failed to create birth record');
    }
  };

  return (
    <div>
      <PageHeader
        title="Register Birth"
        description="Record a new birth and optionally create baby patient file"
        breadcrumbs={[
          { label: "IPD", href: "/app/ipd" },
          { label: "Birth Records", href: "/app/ipd/births" },
          { label: "New" },
        ]}
      />

      <div className="space-y-6">
        {/* Mother Selection */}
        {!selectedMother && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Mother
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    Search for mother by name, MR#, or phone...
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search patients..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>No patients found</CommandEmpty>
                      <CommandGroup heading="Female Patients">
                        {searchResults?.map((patient: any) => (
                          <CommandItem
                            key={patient.id}
                            value={patient.id}
                            onSelect={() => {
                              setSelectedMotherId(patient.id);
                              setSearchOpen(false);
                            }}
                          >
                            <div>
                              <p className="font-medium">
                                {patient.first_name} {patient.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {patient.patient_number} • {patient.phone}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
        )}

        {/* Active Admission Info */}
        {activeAdmission && (
          <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Baby className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400">
                    Active Admission Found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activeAdmission.admission_number} • 
                    {(activeAdmission.bed as any)?.ward?.name} - Bed {(activeAdmission.bed as any)?.bed_number}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Baby Patient Creation Option */}
        {selectedMother && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="createBaby" 
                  checked={createBabyRecord}
                  onCheckedChange={(checked) => setCreateBabyRecord(checked as boolean)}
                />
                <Label htmlFor="createBaby" className="flex-1 cursor-pointer">
                  <span className="font-medium">Automatically create baby patient record</span>
                  <p className="text-sm text-muted-foreground">
                    A new patient file will be created for the baby with name "Baby of {selectedMother.first_name} {selectedMother.last_name}"
                  </p>
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Birth Record Form */}
        {selectedMother && (
          <BirthRecordForm
            motherPatient={selectedMother}
            doctors={doctors || []}
            onSubmit={handleSubmit}
            isLoading={isPending}
            defaultValues={{
              admission_id: activeAdmission?.id,
            }}
          />
        )}
      </div>
    </div>
  );
}

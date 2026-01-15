import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Search } from "lucide-react";
import { 
  useCreateBloodRequest,
  type BloodGroupType,
  type BloodComponentType,
  type BloodRequestPriority,
} from "@/hooks/useBloodBank";
import { usePatients, usePatient } from "@/hooks/usePatients";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";

const bloodGroups: BloodGroupType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const componentTypes: { value: BloodComponentType; label: string }[] = [
  { value: 'whole_blood', label: 'Whole Blood' },
  { value: 'packed_rbc', label: 'Packed RBC' },
  { value: 'fresh_frozen_plasma', label: 'Fresh Frozen Plasma' },
  { value: 'platelet_concentrate', label: 'Platelet Concentrate' },
  { value: 'cryoprecipitate', label: 'Cryoprecipitate' },
];
const priorities: { value: BloodRequestPriority; label: string }[] = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergency', label: 'Emergency' },
];

export default function BloodRequestFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');
  
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(preselectedPatientId);
  
  const { data: patients, isLoading: loadingPatients } = usePatients(patientSearch);
  const { data: selectedPatient } = usePatient(selectedPatientId || undefined);
  const createRequest = useCreateBloodRequest();

  const [formData, setFormData] = useState({
    blood_group: '' as BloodGroupType | '',
    component_type: 'packed_rbc' as BloodComponentType,
    units_requested: 1,
    priority: 'routine' as BloodRequestPriority,
    indication: '',
    required_by: '',
    requesting_department: '',
  });

  // Auto-fill blood group when patient is selected
  useEffect(() => {
    if (selectedPatient?.blood_group && !formData.blood_group) {
      setFormData(prev => ({ ...prev, blood_group: selectedPatient.blood_group as BloodGroupType }));
    }
  }, [selectedPatient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatientId || !formData.blood_group) {
      return;
    }

    try {
      await createRequest.mutateAsync({
        patient_id: selectedPatientId,
        blood_group: formData.blood_group as BloodGroupType,
        component_type: formData.component_type,
        units_requested: formData.units_requested,
        priority: formData.priority,
        indication: formData.indication || null,
        required_by: formData.required_by || null,
        requesting_department: formData.requesting_department || null,
      });
      navigate('/app/blood-bank/requests');
    } catch (error) {
      // Error handled in hook
    }
  };

  const isLoading = createRequest.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Blood Request"
        description="Request blood for a patient"
        actions={
          <Button variant="outline" onClick={() => navigate('/app/blood-bank/requests')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPatient ? (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient.patient_number} • {selectedPatient.phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedPatient.blood_group && (
                    <BloodGroupBadge group={selectedPatient.blood_group} size="lg" />
                  )}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedPatientId(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients by name, phone, or ID..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {patientSearch && patients && patients.length > 0 && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {patients.slice(0, 5).map((patient) => (
                      <div
                        key={patient.id}
                        className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setSelectedPatientId(patient.id);
                          setPatientSearch('');
                        }}
                      >
                        <p className="font-medium">
                          {patient.first_name} {patient.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {patient.patient_number} • {patient.blood_group || 'Blood group unknown'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {patientSearch && patients?.length === 0 && !loadingPatients && (
                  <p className="text-sm text-muted-foreground">No patients found</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blood Request Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="blood_group">Blood Group *</Label>
              <Select 
                value={formData.blood_group} 
                onValueChange={(v) => setFormData({ ...formData, blood_group: v as BloodGroupType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="component_type">Component Type *</Label>
              <Select 
                value={formData.component_type} 
                onValueChange={(v) => setFormData({ ...formData, component_type: v as BloodComponentType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {componentTypes.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="units_requested">Units Required *</Label>
              <Input
                id="units_requested"
                type="number"
                min="1"
                max="10"
                value={formData.units_requested}
                onChange={(e) => setFormData({ ...formData, units_requested: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(v) => setFormData({ ...formData, priority: v as BloodRequestPriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="required_by">Required By</Label>
              <Input
                id="required_by"
                type="datetime-local"
                value={formData.required_by}
                onChange={(e) => setFormData({ ...formData, required_by: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requesting_department">Requesting Department</Label>
              <Input
                id="requesting_department"
                placeholder="e.g., Surgery, ICU, OT"
                value={formData.requesting_department}
                onChange={(e) => setFormData({ ...formData, requesting_department: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="indication">Clinical Indication</Label>
              <Textarea
                id="indication"
                value={formData.indication}
                onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
                placeholder="Reason for blood request (e.g., Pre-operative, Anemia, Blood loss)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/app/blood-bank/requests')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !selectedPatientId || !formData.blood_group}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

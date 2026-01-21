import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Link2, X, User } from "lucide-react";
import { 
  useBloodDonor, 
  useCreateDonor, 
  useUpdateDonor,
  type BloodGroupType 
} from "@/hooks/useBloodBank";
import { usePatients } from "@/hooks/usePatients";
import { differenceInYears } from "date-fns";

const bloodGroups: BloodGroupType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['male', 'female', 'other'];

export default function DonorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');
  const isEditing = !!id;

  const { data: existingDonor, isLoading: loadingDonor } = useBloodDonor(id || '');
  const createDonor = useCreateDonor();
  const updateDonor = useUpdateDonor();

  // Patient search for linking
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(preselectedPatientId);
  const { data: patients } = usePatients(patientSearch);
  const selectedPatient = patients?.find(p => p.id === selectedPatientId);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'male',
    blood_group: 'O+' as BloodGroupType,
    phone: '',
    alternate_phone: '',
    email: '',
    address: '',
    city: '',
    id_type: '',
    id_number: '',
    weight_kg: '',
    hemoglobin_level: '',
    current_medications: '',
    allergies: '',
    consent_given: false,
  });

  // Auto-fill form when patient is selected
  useEffect(() => {
    if (selectedPatient && !isEditing) {
      setFormData(prev => ({
        ...prev,
        first_name: selectedPatient.first_name || prev.first_name,
        last_name: selectedPatient.last_name || prev.last_name,
        date_of_birth: selectedPatient.date_of_birth || prev.date_of_birth,
        gender: selectedPatient.gender || prev.gender,
        blood_group: (selectedPatient.blood_group as BloodGroupType) || prev.blood_group,
        phone: selectedPatient.phone || prev.phone,
        email: selectedPatient.email || prev.email,
        address: selectedPatient.address || prev.address,
        city: selectedPatient.city || prev.city,
      }));
    }
  }, [selectedPatient, isEditing]);

  // Populate form when editing
  useEffect(() => {
    if (existingDonor) {
      setFormData({
        first_name: existingDonor.first_name,
        last_name: existingDonor.last_name || '',
        date_of_birth: existingDonor.date_of_birth,
        gender: existingDonor.gender,
        blood_group: existingDonor.blood_group,
        phone: existingDonor.phone,
        alternate_phone: '',
        email: existingDonor.email || '',
        address: existingDonor.address || '',
        city: existingDonor.city || '',
        id_type: '',
        id_number: '',
        weight_kg: existingDonor.weight_kg?.toString() || '',
        hemoglobin_level: existingDonor.hemoglobin_level?.toString() || '',
        current_medications: '',
        allergies: '',
        consent_given: existingDonor.consent_given,
      });
    }
  }, [existingDonor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const donorData = {
      first_name: formData.first_name,
      last_name: formData.last_name || null,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
      blood_group: formData.blood_group,
      phone: formData.phone,
      email: formData.email || null,
      address: formData.address || null,
      city: formData.city || null,
      weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
      hemoglobin_level: formData.hemoglobin_level ? parseFloat(formData.hemoglobin_level) : null,
      consent_given: formData.consent_given,
      consent_date: formData.consent_given ? new Date().toISOString() : null,
      patient_id: selectedPatientId || null,
    };

    try {
      if (isEditing && id) {
        await updateDonor.mutateAsync({ id, ...donorData });
      } else {
        await createDonor.mutateAsync(donorData);
      }
      navigate('/app/blood-bank/donors');
    } catch (error) {
      // Error handled in hook
    }
  };

  const isLoading = createDonor.isPending || updateDonor.isPending;

  if (isEditing && loadingDonor) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? "Edit Donor" : "Register New Donor"}
        description={isEditing ? "Update donor information" : "Register a new blood donor"}
        actions={
          <Button variant="outline" onClick={() => navigate('/app/blood-bank/donors')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Donors
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Link to Patient (Optional) */}
        {!isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Link to Patient (Optional)
              </CardTitle>
              <CardDescription>
                If this donor is a registered patient, link their records for complete blood history tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPatient ? (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedPatient.first_name} {selectedPatient.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPatient.patient_number} • {selectedPatient.phone}
                        {selectedPatient.blood_group && ` • ${selectedPatient.blood_group}`}
                      </p>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedPatientId(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Search Patient</Label>
                  <Input
                    placeholder="Search by name, phone, or patient number..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                  />
                  {patientSearch && patients && patients.length > 0 && (
                    <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                      {patients.slice(0, 5).map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          className="w-full text-left p-3 hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            setSelectedPatientId(patient.id);
                            setPatientSearch('');
                          }}
                        >
                          <p className="font-medium">
                            {patient.first_name} {patient.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {patient.patient_number} • {patient.phone}
                            {patient.blood_group && ` • ${patient.blood_group}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((g) => (
                    <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="blood_group">Blood Group *</Label>
              <Select 
                value={formData.blood_group} 
                onValueChange={(v) => setFormData({ ...formData, blood_group: v as BloodGroupType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weight_kg">Weight (kg)</Label>
              <Input
                id="weight_kg"
                type="number"
                step="0.1"
                min="40"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hemoglobin_level">Hemoglobin (g/dL)</Label>
              <Input
                id="hemoglobin_level"
                type="number"
                step="0.1"
                min="10"
                max="20"
                value={formData.hemoglobin_level}
                onChange={(e) => setFormData({ ...formData, hemoglobin_level: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="current_medications">Current Medications</Label>
              <Textarea
                id="current_medications"
                value={formData.current_medications}
                onChange={(e) => setFormData({ ...formData, current_medications: e.target.value })}
                placeholder="List any medications currently being taken"
                rows={2}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="allergies">Known Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="List any known allergies"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consent"
                checked={formData.consent_given}
                onCheckedChange={(checked) => setFormData({ ...formData, consent_given: checked === true })}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="consent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Donor Consent
                </label>
                <p className="text-sm text-muted-foreground">
                  I hereby consent to donate blood and confirm that all information provided is accurate to the best of my knowledge.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/app/blood-bank/donors')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !formData.consent_given}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Registering...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Donor' : 'Register Donor'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

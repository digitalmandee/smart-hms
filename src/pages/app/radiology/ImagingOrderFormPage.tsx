import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation, getTranslatedString } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateImagingOrder, IMAGING_MODALITIES, IMAGING_PRIORITIES, ImagingModality, ImagingPriority } from '@/hooks/useImaging';
import { usePatients } from '@/hooks/usePatients';
import { PatientSearch } from '@/components/appointments/PatientSearch';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

export default function ImagingOrderFormPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { mutate: createOrder, isPending: isCreating } = useCreateImagingOrder();
  const { data: patients } = usePatients();

  const preSelectedPatientId = searchParams.get('patientId');
  const preSelectedPriority = searchParams.get('priority') as ImagingPriority | null;

  const [formData, setFormData] = useState({
    modality: '' as ImagingModality | '',
    priority: preSelectedPriority || 'routine' as ImagingPriority,
    procedure_name: '',
    clinical_indication: '',
    scheduled_date: '',
    notes: '',
  });

  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  useEffect(() => {
    if (preSelectedPatientId && patients) {
      const patient = patients.find(p => p.id === preSelectedPatientId);
      if (patient) {
        setSelectedPatient(patient);
      }
    }
  }, [preSelectedPatientId, patients]);

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient?.id || !formData.modality) {
      toast.error('Please select a patient and modality');
      return;
    }

    createOrder({
      patient_id: selectedPatient.id,
      modality: formData.modality as ImagingModality,
      priority: formData.priority as ImagingPriority,
      procedure_name: formData.procedure_name || IMAGING_MODALITIES.find(m => m.value === formData.modality)?.label || formData.modality,
      clinical_indication: formData.clinical_indication || undefined,
      scheduled_date: formData.scheduled_date || undefined,
      notes: formData.notes || undefined,
      status: 'ordered',
    }, {
      onSuccess: () => {
        navigate('/app/radiology/orders');
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('radiology.newImagingOrder' as any)}
        description={t('radiology.newImagingOrderDesc' as any)}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Patient Selection */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientSearch 
                onSelect={handlePatientSelect}
                selectedPatient={selectedPatient}
              />
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modality">Modality *</Label>
                <Select 
                  value={formData.modality} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, modality: value as ImagingModality }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select modality" />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGING_MODALITIES.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="procedure_name">Procedure Name</Label>
                <Input
                  id="procedure_name"
                  value={formData.procedure_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, procedure_name: e.target.value }))}
                  placeholder="e.g., Chest X-Ray PA View"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as ImagingPriority }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGING_PRIORITIES.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Scheduled Date (Optional)</Label>
                <Input
                  id="scheduled_date"
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Clinical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Clinical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinical_indication">Clinical Indication</Label>
                <Textarea
                  id="clinical_indication"
                  value={formData.clinical_indication}
                  onChange={(e) => setFormData(prev => ({ ...prev, clinical_indication: e.target.value }))}
                  placeholder="Reason for imaging, symptoms, provisional diagnosis..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional instructions or notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating}>
            <Save className="h-4 w-4 mr-2" />
            {isCreating ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>
  );
}

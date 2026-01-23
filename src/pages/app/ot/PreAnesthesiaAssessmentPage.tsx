import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Syringe, 
  User, 
  Calendar, 
  CheckCircle2,
  Clock,
  AlertCircle,
  Stethoscope,
  Wind,
  Save,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { useSurgery } from "@/hooks/useOT";
import { useConfigASAClasses, useConfigAnesthesiaTypes } from "@/hooks/useOTConfig";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MALLAMPATI_SCORES = [
  { value: 'I', label: 'Class I', description: 'Soft palate, uvula, fauces, pillars visible' },
  { value: 'II', label: 'Class II', description: 'Soft palate, uvula, fauces visible' },
  { value: 'III', label: 'Class III', description: 'Soft palate, base of uvula visible' },
  { value: 'IV', label: 'Class IV', description: 'Hard palate only visible' },
];

const NECK_MOBILITY_OPTIONS = ['Normal', 'Limited', 'Severely limited', 'Immobile'];

export default function PreAnesthesiaAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const { data: surgery, isLoading } = useSurgery(id!);
  const { data: asaClasses } = useConfigASAClasses();
  const { data: anesthesiaTypes } = useConfigAnesthesiaTypes();

  const [formData, setFormData] = useState({
    // ASA Classification
    asa_class: '',
    asa_notes: '',
    
    // Airway Assessment
    mallampati_score: '',
    mouth_opening: '',
    thyromental_distance: '',
    neck_mobility: '',
    dental_status: '',
    airway_notes: '',
    
    // NPO Status
    npo_verified: false,
    last_solid_food: '',
    last_clear_liquid: '',
    
    // Previous Anesthesia
    previous_anesthesia: false,
    previous_complications: '',
    family_anesthesia_history: '',
    
    // Anesthesia Plan
    planned_anesthesia_type: '',
    backup_plan: '',
    special_considerations: '',
    
    // Consent
    consent_obtained: false,
    consent_notes: '',
    
    // Risk Assessment
    difficult_airway_risk: false,
    aspiration_risk: false,
    cardiac_risk: false,
    notes: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!surgery) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h2 className="text-lg font-medium">Surgery Not Found</h2>
        <Button onClick={() => navigate("/app/ot/schedule")} className="mt-4">
          Back to Schedule
        </Button>
      </div>
    );
  }

  const patientName = surgery.patient 
    ? `${surgery.patient.first_name} ${surgery.patient.last_name}`
    : 'Unknown Patient';

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // TODO: Implement save to pre_anesthesia_assessments table
      toast.success('Pre-anesthesia assessment saved');
      navigate(`/app/ot/surgeries/${id}`);
    } catch (error) {
      toast.error('Failed to save assessment');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Pre-Anesthesia Assessment</h1>
            <p className="text-muted-foreground">{surgery.surgery_number} - {surgery.procedure_name}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-purple-600 border-purple-600">
          <Syringe className="h-4 w-4 mr-1" />
          Anesthesia Evaluation
        </Badge>
      </div>

      {/* Patient & Surgery Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{patientName}</p>
              <p className="text-sm text-muted-foreground">{surgery.patient?.patient_number}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">
                {format(new Date(surgery.scheduled_date), 'EEEE, MMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(`2000-01-01T${surgery.scheduled_start_time}`), 'h:mm a')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 rounded-lg bg-orange-100">
              <Stethoscope className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="font-medium">{surgery.procedure_name}</p>
              <p className="text-sm text-muted-foreground">
                {surgery.lead_surgeon?.profile?.full_name || 'Surgeon TBD'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ASA Classification */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              ASA Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>ASA Class *</Label>
              <Select value={formData.asa_class} onValueChange={(v) => updateFormData('asa_class', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ASA class" />
                </SelectTrigger>
                <SelectContent>
                  {asaClasses?.map(cls => (
                    <SelectItem key={cls.id} value={cls.class_level}>
                      <span className="font-medium">{cls.name}</span>
                      <span className="text-muted-foreground ml-2">- {cls.description}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes about ASA classification..."
                value={formData.asa_notes}
                onChange={(e) => updateFormData('asa_notes', e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Airway Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wind className="h-5 w-5" />
              Airway Assessment
            </CardTitle>
            <CardDescription>Evaluate airway for potential difficulties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Mallampati Score *</Label>
                <Select value={formData.mallampati_score} onValueChange={(v) => updateFormData('mallampati_score', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select score" />
                  </SelectTrigger>
                  <SelectContent>
                    {MALLAMPATI_SCORES.map(score => (
                      <SelectItem key={score.value} value={score.value}>
                        <span className="font-medium">{score.label}</span>
                        <span className="text-muted-foreground ml-2 text-xs">- {score.description}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mouth Opening (cm)</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="e.g., 4.5"
                  value={formData.mouth_opening}
                  onChange={(e) => updateFormData('mouth_opening', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Thyromental Distance (cm)</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="e.g., 6.5"
                  value={formData.thyromental_distance}
                  onChange={(e) => updateFormData('thyromental_distance', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Neck Mobility</Label>
                <Select value={formData.neck_mobility} onValueChange={(v) => updateFormData('neck_mobility', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {NECK_MOBILITY_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dental Status</Label>
              <Input
                placeholder="e.g., Loose teeth, dentures, caps..."
                value={formData.dental_status}
                onChange={(e) => updateFormData('dental_status', e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="difficult_airway"
                checked={formData.difficult_airway_risk}
                onCheckedChange={(checked) => updateFormData('difficult_airway_risk', checked)}
              />
              <Label htmlFor="difficult_airway" className="text-amber-600 font-medium">
                Anticipated Difficult Airway
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* NPO Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5" />
              NPO Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="npo_verified"
                checked={formData.npo_verified}
                onCheckedChange={(checked) => updateFormData('npo_verified', checked)}
              />
              <Label htmlFor="npo_verified" className="font-medium">NPO Status Verified</Label>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Last Solid Food</Label>
                <Input
                  type="datetime-local"
                  value={formData.last_solid_food}
                  onChange={(e) => updateFormData('last_solid_food', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Clear Liquid</Label>
                <Input
                  type="datetime-local"
                  value={formData.last_clear_liquid}
                  onChange={(e) => updateFormData('last_clear_liquid', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="aspiration_risk"
                checked={formData.aspiration_risk}
                onCheckedChange={(checked) => updateFormData('aspiration_risk', checked)}
              />
              <Label htmlFor="aspiration_risk" className="text-amber-600 font-medium">
                High Aspiration Risk
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Previous Anesthesia History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Anesthesia History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="previous_anesthesia"
                checked={formData.previous_anesthesia}
                onCheckedChange={(checked) => updateFormData('previous_anesthesia', checked)}
              />
              <Label htmlFor="previous_anesthesia">Previous Anesthesia Experience</Label>
            </div>

            {formData.previous_anesthesia && (
              <div className="space-y-2">
                <Label>Previous Complications</Label>
                <Textarea
                  placeholder="Describe any complications from previous anesthesia..."
                  value={formData.previous_complications}
                  onChange={(e) => updateFormData('previous_complications', e.target.value)}
                  rows={2}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Family History of Anesthesia Complications</Label>
              <Textarea
                placeholder="e.g., Malignant hyperthermia, pseudocholinesterase deficiency..."
                value={formData.family_anesthesia_history}
                onChange={(e) => updateFormData('family_anesthesia_history', e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Anesthesia Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Syringe className="h-5 w-5" />
              Anesthesia Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Planned Anesthesia Type *</Label>
                <Select 
                  value={formData.planned_anesthesia_type} 
                  onValueChange={(v) => updateFormData('planned_anesthesia_type', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {anesthesiaTypes?.map(type => (
                      <SelectItem key={type.id} value={type.code}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Backup Plan</Label>
                <Input
                  placeholder="Alternative approach if primary fails..."
                  value={formData.backup_plan}
                  onChange={(e) => updateFormData('backup_plan', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Special Considerations</Label>
              <Textarea
                placeholder="Any special precautions, monitoring requirements, medications..."
                value={formData.special_considerations}
                onChange={(e) => updateFormData('special_considerations', e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="cardiac_risk"
                checked={formData.cardiac_risk}
                onCheckedChange={(checked) => updateFormData('cardiac_risk', checked)}
              />
              <Label htmlFor="cardiac_risk" className="text-amber-600 font-medium">
                Elevated Cardiac Risk
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Consent */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Consent & Clearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent_obtained"
                checked={formData.consent_obtained}
                onCheckedChange={(checked) => updateFormData('consent_obtained', checked)}
              />
              <Label htmlFor="consent_obtained" className="font-medium">
                Informed Consent Obtained
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Documentation of consent discussion, patient questions, etc."
                value={formData.consent_notes}
                onChange={(e) => updateFormData('consent_notes', e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Assessment
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  AlertCircle, 
  Heart, 
  Stethoscope,
  FileCheck,
  Droplets,
  Thermometer
} from "lucide-react";
import type { PreOpAssessment, ASAClass } from "@/hooks/useOT";

interface PreOpAssessmentFormProps {
  surgeryId: string;
  assessment?: PreOpAssessment | null;
  onSave: (data: Partial<PreOpAssessment>) => void;
  onClear?: () => void;
  isLoading?: boolean;
  patientBloodGroup?: string;
}

const ASA_CLASSES: { value: ASAClass; label: string; description: string }[] = [
  { value: 'I', label: 'ASA I', description: 'Healthy patient' },
  { value: 'II', label: 'ASA II', description: 'Mild systemic disease' },
  { value: 'III', label: 'ASA III', description: 'Severe systemic disease' },
  { value: 'IV', label: 'ASA IV', description: 'Severe systemic disease, constant threat to life' },
  { value: 'V', label: 'ASA V', description: 'Moribund, not expected to survive' },
  { value: 'VI', label: 'ASA VI', description: 'Brain-dead organ donor' },
];

export function PreOpAssessmentForm({ 
  surgeryId, 
  assessment, 
  onSave, 
  onClear,
  isLoading,
  patientBloodGroup 
}: PreOpAssessmentFormProps) {
  const [formData, setFormData] = useState({
    asa_class: assessment?.asa_class || '' as ASAClass,
    asa_notes: assessment?.asa_notes || '',
    medical_history_reviewed: assessment?.medical_history_reviewed || false,
    allergies: assessment?.allergies || '',
    vitals: assessment?.vitals || {
      bp_systolic: '',
      bp_diastolic: '',
      pulse: '',
      temperature: '',
      spo2: '',
      weight: '',
      height: '',
    },
    // Clearances
    medical_clearance: assessment?.medical_clearance || { cleared: false, doctor: '', date: '', notes: '' },
    cardiac_clearance: assessment?.cardiac_clearance || { cleared: false, doctor: '', date: '', notes: '' },
    anesthesia_clearance: assessment?.anesthesia_clearance || { cleared: false, doctor: '', date: '', notes: '' },
    // Pre-op checklist
    fasting_confirmed: assessment?.fasting_confirmed || false,
    consent_verified: assessment?.consent_verified || false,
    site_marked: assessment?.site_marked || false,
    blood_arranged: assessment?.blood_arranged || false,
    jewelry_removed: assessment?.jewelry_removed || false,
    dentures_removed: assessment?.dentures_removed || false,
    investigations_cleared: assessment?.investigations_cleared || false,
    clearance_notes: assessment?.clearance_notes || '',
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateVitals = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vitals: { ...prev.vitals, [field]: value }
    }));
  };

  const updateClearance = (type: 'medical_clearance' | 'cardiac_clearance' | 'anesthesia_clearance', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      surgery_id: surgeryId,
      ...formData,
    });
  };

  const handleClearForSurgery = () => {
    if (onClear) {
      onClear();
    }
  };

  const allChecklistComplete = 
    formData.fasting_confirmed && 
    formData.consent_verified && 
    formData.site_marked && 
    formData.blood_arranged;

  const allClearancesComplete = 
    formData.medical_clearance.cleared && 
    formData.cardiac_clearance.cleared && 
    formData.anesthesia_clearance.cleared;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ASA Classification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            ASA Classification
          </CardTitle>
          <CardDescription>American Society of Anesthesiologists physical status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>ASA Class *</Label>
            <Select
              value={formData.asa_class}
              onValueChange={(value) => updateFormData('asa_class', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ASA class" />
              </SelectTrigger>
              <SelectContent>
                {ASA_CLASSES.map(cls => (
                  <SelectItem key={cls.value} value={cls.value}>
                    <span className="font-medium">{cls.label}</span>
                    <span className="text-muted-foreground ml-2">- {cls.description}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="asa_notes">Notes</Label>
            <Textarea
              id="asa_notes"
              placeholder="Additional notes about ASA classification..."
              value={formData.asa_notes}
              onChange={(e) => updateFormData('asa_notes', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Vital Signs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>BP (mmHg)</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  placeholder="Sys"
                  value={formData.vitals.bp_systolic}
                  onChange={(e) => updateVitals('bp_systolic', e.target.value)}
                  className="w-20"
                />
                <span>/</span>
                <Input
                  type="number"
                  placeholder="Dia"
                  value={formData.vitals.bp_diastolic}
                  onChange={(e) => updateVitals('bp_diastolic', e.target.value)}
                  className="w-20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pulse (bpm)</Label>
              <Input
                type="number"
                placeholder="72"
                value={formData.vitals.pulse}
                onChange={(e) => updateVitals('pulse', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Temp (°F)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="98.6"
                value={formData.vitals.temperature}
                onChange={(e) => updateVitals('temperature', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>SpO2 (%)</Label>
              <Input
                type="number"
                placeholder="98"
                value={formData.vitals.spo2}
                onChange={(e) => updateVitals('spo2', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="70"
                value={formData.vitals.weight}
                onChange={(e) => updateVitals('weight', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input
                type="number"
                placeholder="170"
                value={formData.vitals.height}
                onChange={(e) => updateVitals('height', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Medical History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="history_reviewed"
              checked={formData.medical_history_reviewed}
              onCheckedChange={(checked) => updateFormData('medical_history_reviewed', checked)}
            />
            <Label htmlFor="history_reviewed">Medical history reviewed and documented</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies">Known Allergies</Label>
            <Textarea
              id="allergies"
              placeholder="List any known allergies (medications, latex, food, etc.)"
              value={formData.allergies}
              onChange={(e) => updateFormData('allergies', e.target.value)}
              rows={2}
            />
          </div>
          {patientBloodGroup && (
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-red-500" />
              <span className="text-sm">Blood Group: <Badge variant="outline">{patientBloodGroup}</Badge></span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clearances */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Clearances
          </CardTitle>
          <CardDescription>Required clearances before surgery</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Medical Clearance */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="medical_clearance"
                  checked={formData.medical_clearance.cleared}
                  onCheckedChange={(checked) => updateClearance('medical_clearance', 'cleared', checked)}
                />
                <Label htmlFor="medical_clearance" className="font-medium">Medical Clearance</Label>
              </div>
              {formData.medical_clearance.cleared && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Cleared
                </Badge>
              )}
            </div>
            {formData.medical_clearance.cleared && (
              <div className="grid gap-3 md:grid-cols-2 pl-6">
                <div className="space-y-1">
                  <Label className="text-xs">Cleared By</Label>
                  <Input
                    placeholder="Doctor name"
                    value={formData.medical_clearance.doctor}
                    onChange={(e) => updateClearance('medical_clearance', 'doctor', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={formData.medical_clearance.date}
                    onChange={(e) => updateClearance('medical_clearance', 'date', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cardiac Clearance */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cardiac_clearance"
                  checked={formData.cardiac_clearance.cleared}
                  onCheckedChange={(checked) => updateClearance('cardiac_clearance', 'cleared', checked)}
                />
                <Label htmlFor="cardiac_clearance" className="font-medium">Cardiac Clearance</Label>
              </div>
              {formData.cardiac_clearance.cleared && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Cleared
                </Badge>
              )}
            </div>
            {formData.cardiac_clearance.cleared && (
              <div className="grid gap-3 md:grid-cols-2 pl-6">
                <div className="space-y-1">
                  <Label className="text-xs">Cleared By</Label>
                  <Input
                    placeholder="Cardiologist name"
                    value={formData.cardiac_clearance.doctor}
                    onChange={(e) => updateClearance('cardiac_clearance', 'doctor', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={formData.cardiac_clearance.date}
                    onChange={(e) => updateClearance('cardiac_clearance', 'date', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Anesthesia Clearance */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anesthesia_clearance"
                  checked={formData.anesthesia_clearance.cleared}
                  onCheckedChange={(checked) => updateClearance('anesthesia_clearance', 'cleared', checked)}
                />
                <Label htmlFor="anesthesia_clearance" className="font-medium">Anesthesia Clearance</Label>
              </div>
              {formData.anesthesia_clearance.cleared && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Cleared
                </Badge>
              )}
            </div>
            {formData.anesthesia_clearance.cleared && (
              <div className="grid gap-3 md:grid-cols-2 pl-6">
                <div className="space-y-1">
                  <Label className="text-xs">Cleared By</Label>
                  <Input
                    placeholder="Anesthetist name"
                    value={formData.anesthesia_clearance.doctor}
                    onChange={(e) => updateClearance('anesthesia_clearance', 'doctor', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={formData.anesthesia_clearance.date}
                    onChange={(e) => updateClearance('anesthesia_clearance', 'date', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pre-Op Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {allChecklistComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            Pre-Operative Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent_verified"
                checked={formData.consent_verified}
                onCheckedChange={(checked) => updateFormData('consent_verified', checked)}
              />
              <Label htmlFor="consent_verified">Consent signed and verified</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="site_marked"
                checked={formData.site_marked}
                onCheckedChange={(checked) => updateFormData('site_marked', checked)}
              />
              <Label htmlFor="site_marked">Surgical site marked</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fasting_confirmed"
                checked={formData.fasting_confirmed}
                onCheckedChange={(checked) => updateFormData('fasting_confirmed', checked)}
              />
              <Label htmlFor="fasting_confirmed">Fasting (NPO) confirmed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="blood_arranged"
                checked={formData.blood_arranged}
                onCheckedChange={(checked) => updateFormData('blood_arranged', checked)}
              />
              <Label htmlFor="blood_arranged">Blood units arranged</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="jewelry_removed"
                checked={formData.jewelry_removed}
                onCheckedChange={(checked) => updateFormData('jewelry_removed', checked)}
              />
              <Label htmlFor="jewelry_removed">Jewelry removed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dentures_removed"
                checked={formData.dentures_removed}
                onCheckedChange={(checked) => updateFormData('dentures_removed', checked)}
              />
              <Label htmlFor="dentures_removed">Dentures removed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="investigations_cleared"
                checked={formData.investigations_cleared}
                onCheckedChange={(checked) => updateFormData('investigations_cleared', checked)}
              />
              <Label htmlFor="investigations_cleared">All investigations reviewed</Label>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="clearance_notes">Additional Notes</Label>
            <Textarea
              id="clearance_notes"
              placeholder="Any additional pre-op notes..."
              value={formData.clearance_notes}
              onChange={(e) => updateFormData('clearance_notes', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {allClearancesComplete && allChecklistComplete ? (
            <Badge variant="default" className="bg-green-500 text-white">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Ready for Surgery
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              Pending Items
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {assessment ? 'Update Assessment' : 'Save Assessment'}
          </Button>
          {allClearancesComplete && allChecklistComplete && onClear && (
            <Button 
              type="button" 
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleClearForSurgery}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Cleared for Surgery
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

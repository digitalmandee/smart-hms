import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  FileText,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Package
} from "lucide-react";
import type { IntraOpNotes } from "@/hooks/useOT";

interface IntraOpNotesFormProps {
  surgeryId: string;
  notes?: IntraOpNotes | null;
  procedureName?: string;
  onSave: (data: Partial<IntraOpNotes>) => void;
  isLoading?: boolean;
  documentedBy?: string;
}

interface SpecimenEntry {
  id: string;
  description: string;
  label: string;
  sendToPathology: boolean;
}

interface DrainEntry {
  id: string;
  type: string;
  location: string;
  size: string;
}

const INCISION_TYPES = [
  'Midline',
  'Paramedian',
  'Transverse',
  'Oblique',
  'Pfannenstiel',
  'Kocher',
  'McBurney',
  'Gridiron',
  'Laparoscopic ports',
  'Other',
];

const PATIENT_POSITIONS = [
  'Supine',
  'Prone',
  'Lateral (Left)',
  'Lateral (Right)',
  'Lithotomy',
  'Trendelenburg',
  'Reverse Trendelenburg',
  'Sitting',
  'Semi-Fowler',
];

const APPROACHES = [
  'Open',
  'Laparoscopic',
  'Robotic',
  'Endoscopic',
  'Minimally Invasive',
  'Hybrid',
];

export function IntraOpNotesForm({ 
  surgeryId, 
  notes, 
  procedureName,
  onSave, 
  isLoading,
  documentedBy 
}: IntraOpNotesFormProps) {
  const [formData, setFormData] = useState({
    procedure_performed: notes?.procedure_performed || procedureName || '',
    approach: notes?.approach || '',
    position: notes?.position || '',
    skin_prep: notes?.skin_prep || 'Betadine and spirit',
    draping: notes?.draping || 'Standard sterile draping',
    incision_type: notes?.incision_type || '',
    incision_time: notes?.incision_time || '',
    closure_time: notes?.closure_time || '',
    intra_op_findings: notes?.intra_op_findings || '',
    pathology_findings: notes?.pathology_findings || '',
    sponge_count_correct: notes?.sponge_count_correct ?? true,
    instrument_count_correct: notes?.instrument_count_correct ?? true,
    needle_count_correct: notes?.needle_count_correct ?? true,
    count_notes: notes?.count_notes || '',
    complications: notes?.complications || '',
    blood_loss_ml: notes?.blood_loss_ml?.toString() || '',
    closure_details: notes?.closure_details || '',
    dressing_type: notes?.dressing_type || '',
  });

  const [specimens, setSpecimens] = useState<SpecimenEntry[]>(
    (notes?.specimens as SpecimenEntry[]) || []
  );
  const [drains, setDrains] = useState<DrainEntry[]>(
    (notes?.drains as DrainEntry[]) || []
  );

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSpecimen = () => {
    setSpecimens(prev => [...prev, {
      id: crypto.randomUUID(),
      description: '',
      label: '',
      sendToPathology: true,
    }]);
  };

  const updateSpecimen = (id: string, field: string, value: any) => {
    setSpecimens(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSpecimen = (id: string) => {
    setSpecimens(prev => prev.filter(s => s.id !== id));
  };

  const addDrain = () => {
    setDrains(prev => [...prev, {
      id: crypto.randomUUID(),
      type: '',
      location: '',
      size: '',
    }]);
  };

  const updateDrain = (id: string, field: string, value: string) => {
    setDrains(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const removeDrain = (id: string) => {
    setDrains(prev => prev.filter(d => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      surgery_id: surgeryId,
      documented_by: documentedBy || '',
      ...formData,
      blood_loss_ml: formData.blood_loss_ml ? parseInt(formData.blood_loss_ml) : undefined,
      specimens,
      drains,
    });
  };

  const allCountsCorrect = formData.sponge_count_correct && 
    formData.instrument_count_correct && 
    formData.needle_count_correct;

  // Check for missing required completion fields
  const missingRequiredFields = [];
  if (!formData.closure_details) missingRequiredFields.push("Closure details");
  if (!formData.sponge_count_correct) missingRequiredFields.push("Sponge count verification");
  if (!formData.instrument_count_correct) missingRequiredFields.push("Instrument count verification");
  if (!formData.needle_count_correct) missingRequiredFields.push("Needle count verification");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Completion Requirements Warning */}
      {missingRequiredFields.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Required for surgery completion:</span>
            </div>
            <ul className="list-disc list-inside text-sm text-orange-600 mt-2">
              {missingRequiredFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Procedure Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            Procedure Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Procedure Performed *</Label>
            <Textarea
              placeholder="Describe the procedure performed..."
              value={formData.procedure_performed}
              onChange={(e) => updateFormData('procedure_performed', e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Approach</Label>
              <Select
                value={formData.approach}
                onValueChange={(value) => updateFormData('approach', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select approach" />
                </SelectTrigger>
                <SelectContent>
                  {APPROACHES.map(a => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Patient Position</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => updateFormData('position', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {PATIENT_POSITIONS.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Incision Type</Label>
              <Select
                value={formData.incision_type}
                onValueChange={(value) => updateFormData('incision_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select incision" />
                </SelectTrigger>
                <SelectContent>
                  {INCISION_TYPES.map(i => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Skin Preparation</Label>
              <Input
                placeholder="e.g., Betadine and spirit"
                value={formData.skin_prep}
                onChange={(e) => updateFormData('skin_prep', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Draping</Label>
              <Input
                placeholder="e.g., Standard sterile draping"
                value={formData.draping}
                onChange={(e) => updateFormData('draping', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Incision Time</Label>
              <Input
                type="time"
                value={formData.incision_time}
                onChange={(e) => updateFormData('incision_time', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Closure Time</Label>
              <Input
                type="time"
                value={formData.closure_time}
                onChange={(e) => updateFormData('closure_time', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Findings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Intra-Operative Findings</Label>
            <Textarea
              placeholder="Describe what was found during surgery..."
              value={formData.intra_op_findings}
              onChange={(e) => updateFormData('intra_op_findings', e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Pathology Findings (if any)</Label>
            <Textarea
              placeholder="Describe any pathological findings..."
              value={formData.pathology_findings}
              onChange={(e) => updateFormData('pathology_findings', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Specimens */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-5 w-5" />
              Specimens
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addSpecimen}>
              <Plus className="h-4 w-4 mr-1" /> Add Specimen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {specimens.length > 0 ? (
            <div className="space-y-3">
              {specimens.map(specimen => (
                <div key={specimen.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-1 grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Description</Label>
                      <Input
                        placeholder="e.g., Appendix"
                        value={specimen.description}
                        onChange={(e) => updateSpecimen(specimen.id, 'description', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input
                        placeholder="e.g., SP-001"
                        value={specimen.label}
                        onChange={(e) => updateSpecimen(specimen.id, 'label', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Checkbox
                      checked={specimen.sendToPathology}
                      onCheckedChange={(checked) => updateSpecimen(specimen.id, 'sendToPathology', checked)}
                    />
                    <Label className="text-xs">Pathology</Label>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="mt-5" onClick={() => removeSpecimen(specimen.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No specimens collected
            </p>
          )}
        </CardContent>
      </Card>

      {/* Counts Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {allCountsCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            )}
            Counts Verification
          </CardTitle>
          <CardDescription>Verify all counts before closure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sponge_count"
                checked={formData.sponge_count_correct}
                onCheckedChange={(checked) => updateFormData('sponge_count_correct', checked)}
              />
              <Label htmlFor="sponge_count" className="font-medium">
                Sponge Count Correct
              </Label>
              {formData.sponge_count_correct && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="instrument_count"
                checked={formData.instrument_count_correct}
                onCheckedChange={(checked) => updateFormData('instrument_count_correct', checked)}
              />
              <Label htmlFor="instrument_count" className="font-medium">
                Instrument Count Correct
              </Label>
              {formData.instrument_count_correct && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="needle_count"
                checked={formData.needle_count_correct}
                onCheckedChange={(checked) => updateFormData('needle_count_correct', checked)}
              />
              <Label htmlFor="needle_count" className="font-medium">
                Needle Count Correct
              </Label>
              {formData.needle_count_correct && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
          {!allCountsCorrect && (
            <div className="space-y-2">
              <Label>Count Discrepancy Notes *</Label>
              <Textarea
                placeholder="Explain count discrepancy and actions taken..."
                value={formData.count_notes}
                onChange={(e) => updateFormData('count_notes', e.target.value)}
                rows={2}
                className="border-amber-500"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drains & Catheters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Drains & Catheters</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addDrain}>
              <Plus className="h-4 w-4 mr-1" /> Add Drain
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {drains.length > 0 ? (
            <div className="space-y-3">
              {drains.map(drain => (
                <div key={drain.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1 grid gap-3 md:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Type</Label>
                      <Input
                        placeholder="e.g., Romovac"
                        value={drain.type}
                        onChange={(e) => updateDrain(drain.id, 'type', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Location</Label>
                      <Input
                        placeholder="e.g., Right iliac fossa"
                        value={drain.location}
                        onChange={(e) => updateDrain(drain.id, 'location', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Size</Label>
                      <Input
                        placeholder="e.g., 14 Fr"
                        value={drain.size}
                        onChange={(e) => updateDrain(drain.id, 'size', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeDrain(drain.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No drains placed
            </p>
          )}
        </CardContent>
      </Card>

      {/* Closure & Complications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Closure & Complications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Estimated Blood Loss (ml)</Label>
              <Input
                type="number"
                placeholder="e.g., 200"
                value={formData.blood_loss_ml}
                onChange={(e) => updateFormData('blood_loss_ml', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Dressing Type</Label>
              <Input
                placeholder="e.g., Sterile gauze with Tegaderm"
                value={formData.dressing_type}
                onChange={(e) => updateFormData('dressing_type', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Closure Details
              {!formData.closure_details && (
                <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                  Required for completion
                </Badge>
              )}
            </Label>
            <Textarea
              placeholder="Describe closure technique and suture materials used..."
              value={formData.closure_details}
              onChange={(e) => updateFormData('closure_details', e.target.value)}
              rows={2}
              className={!formData.closure_details ? "border-orange-300" : ""}
            />
          </div>
          <div className="space-y-2">
            <Label>Complications</Label>
            <Textarea
              placeholder="Any intra-operative complications..."
              value={formData.complications}
              onChange={(e) => updateFormData('complications', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading || !formData.procedure_performed}>
          {notes ? 'Update Notes' : 'Save Operative Notes'}
        </Button>
      </div>
    </form>
  );
}

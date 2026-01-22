import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Trash2, 
  Syringe,
  Activity,
  Droplets,
  Clock
} from "lucide-react";
import type { AnesthesiaRecord, AnesthesiaType } from "@/hooks/useOT";
import { useConfigAnesthesiaTypes, useConfigAirwayDevices } from "@/hooks/useOTConfig";

interface AnesthesiaRecordFormProps {
  surgeryId: string;
  record?: AnesthesiaRecord | null;
  onSave: (data: Partial<AnesthesiaRecord>) => void;
  isLoading?: boolean;
  anesthetistId?: string;
}

interface DrugEntry {
  id: string;
  name: string;
  dose: string;
  unit: string;
  time: string;
  route: string;
}

interface VitalEntry {
  id: string;
  time: string;
  bp_systolic: string;
  bp_diastolic: string;
  pulse: string;
  spo2: string;
  etco2: string;
}

// Fallback values if config not loaded
const FALLBACK_ANESTHESIA_TYPES: { value: AnesthesiaType; label: string }[] = [
  { value: 'general', label: 'General Anesthesia' },
  { value: 'spinal', label: 'Spinal Anesthesia' },
  { value: 'epidural', label: 'Epidural Anesthesia' },
  { value: 'local', label: 'Local Anesthesia' },
  { value: 'regional', label: 'Regional Block' },
  { value: 'sedation', label: 'Sedation' },
  { value: 'combined', label: 'Combined (GA + Regional)' },
];

const FALLBACK_AIRWAY_DEVICES = [
  'ETT (Endotracheal Tube)',
  'LMA (Laryngeal Mask Airway)',
  'I-gel',
  'Face Mask',
  'Nasal Cannula',
];

export function AnesthesiaRecordForm({ 
  surgeryId, 
  record, 
  onSave, 
  isLoading,
  anesthetistId 
}: AnesthesiaRecordFormProps) {
  // Fetch dynamic config
  const { data: configAnesthesiaTypes, isLoading: typesLoading } = useConfigAnesthesiaTypes();
  const { data: configAirwayDevices, isLoading: devicesLoading } = useConfigAirwayDevices();

  // Use config or fallback
  const anesthesiaTypes = configAnesthesiaTypes?.length 
    ? configAnesthesiaTypes.map(t => ({ value: t.code as AnesthesiaType, label: t.name }))
    : FALLBACK_ANESTHESIA_TYPES;
  
  const airwayDevices = configAirwayDevices?.length
    ? configAirwayDevices.map(d => d.name)
    : FALLBACK_AIRWAY_DEVICES;

  const [formData, setFormData] = useState({
    anesthesia_type: record?.anesthesia_type || '' as AnesthesiaType,
    anesthesia_plan: record?.anesthesia_plan || '',
    anesthesia_start_time: record?.anesthesia_start_time || '',
    induction_time: record?.induction_time || '',
    intubation_time: record?.intubation_time || '',
    extubation_time: record?.extubation_time || '',
    anesthesia_end_time: record?.anesthesia_end_time || '',
    airway_device: record?.airway_device || '',
    airway_size: record?.airway_size || '',
    intubation_grade: record?.intubation_grade || '',
    intubation_attempts: record?.intubation_attempts?.toString() || '1',
    airway_complications: record?.airway_complications || '',
    total_input_ml: record?.total_input_ml?.toString() || '',
    urine_output_ml: record?.urine_output_ml?.toString() || '',
    blood_loss_ml: record?.blood_loss_ml?.toString() || '',
    complications: record?.complications || '',
    recovery_score: record?.recovery_score?.toString() || '',
    handover_notes: record?.handover_notes || '',
  });

  const [inductionDrugs, setInductionDrugs] = useState<DrugEntry[]>(
    (record?.induction_agents as DrugEntry[]) || []
  );
  const [maintenanceDrugs, setMaintenanceDrugs] = useState<DrugEntry[]>(
    (record?.maintenance_agents as DrugEntry[]) || []
  );
  const [muscleRelaxants, setMuscleRelaxants] = useState<DrugEntry[]>(
    (record?.muscle_relaxants as DrugEntry[]) || []
  );
  const [vitalsLog, setVitalsLog] = useState<VitalEntry[]>(
    (record?.vitals_log as VitalEntry[]) || []
  );

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addDrug = (type: 'induction' | 'maintenance' | 'relaxant') => {
    const newDrug: DrugEntry = {
      id: crypto.randomUUID(),
      name: '',
      dose: '',
      unit: 'mg',
      time: '',
      route: 'IV',
    };
    if (type === 'induction') setInductionDrugs(prev => [...prev, newDrug]);
    else if (type === 'maintenance') setMaintenanceDrugs(prev => [...prev, newDrug]);
    else setMuscleRelaxants(prev => [...prev, newDrug]);
  };

  const updateDrug = (type: 'induction' | 'maintenance' | 'relaxant', id: string, field: string, value: string) => {
    const updateFn = (drugs: DrugEntry[]) => 
      drugs.map(d => d.id === id ? { ...d, [field]: value } : d);
    
    if (type === 'induction') setInductionDrugs(updateFn);
    else if (type === 'maintenance') setMaintenanceDrugs(updateFn);
    else setMuscleRelaxants(updateFn);
  };

  const removeDrug = (type: 'induction' | 'maintenance' | 'relaxant', id: string) => {
    const filterFn = (drugs: DrugEntry[]) => drugs.filter(d => d.id !== id);
    
    if (type === 'induction') setInductionDrugs(filterFn);
    else if (type === 'maintenance') setMaintenanceDrugs(filterFn);
    else setMuscleRelaxants(filterFn);
  };

  const addVitalEntry = () => {
    setVitalsLog(prev => [...prev, {
      id: crypto.randomUUID(),
      time: new Date().toTimeString().slice(0, 5),
      bp_systolic: '',
      bp_diastolic: '',
      pulse: '',
      spo2: '',
      etco2: '',
    }]);
  };

  const updateVital = (id: string, field: string, value: string) => {
    setVitalsLog(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const removeVital = (id: string) => {
    setVitalsLog(prev => prev.filter(v => v.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      surgery_id: surgeryId,
      anesthetist_id: anesthetistId || '',
      ...formData,
      intubation_attempts: formData.intubation_attempts ? parseInt(formData.intubation_attempts) : undefined,
      total_input_ml: formData.total_input_ml ? parseInt(formData.total_input_ml) : undefined,
      urine_output_ml: formData.urine_output_ml ? parseInt(formData.urine_output_ml) : undefined,
      blood_loss_ml: formData.blood_loss_ml ? parseInt(formData.blood_loss_ml) : undefined,
      recovery_score: formData.recovery_score ? parseInt(formData.recovery_score) : undefined,
      induction_agents: inductionDrugs,
      maintenance_agents: maintenanceDrugs,
      muscle_relaxants: muscleRelaxants,
      vitals_log: vitalsLog,
    });
  };

  const DrugList = ({ 
    drugs, 
    type, 
    title 
  }: { 
    drugs: DrugEntry[]; 
    type: 'induction' | 'maintenance' | 'relaxant';
    title: string;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{title}</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => addDrug(type)}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      {drugs.map(drug => (
        <div key={drug.id} className="flex items-center gap-2 p-2 border rounded">
          <Input
            placeholder="Drug name"
            value={drug.name}
            onChange={(e) => updateDrug(type, drug.id, 'name', e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Dose"
            value={drug.dose}
            onChange={(e) => updateDrug(type, drug.id, 'dose', e.target.value)}
            className="w-20"
          />
          <Select value={drug.unit} onValueChange={(v) => updateDrug(type, drug.id, 'unit', v)}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mg">mg</SelectItem>
              <SelectItem value="mcg">mcg</SelectItem>
              <SelectItem value="ml">ml</SelectItem>
              <SelectItem value="mg/kg">mg/kg</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="time"
            value={drug.time}
            onChange={(e) => updateDrug(type, drug.id, 'time', e.target.value)}
            className="w-28"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeDrug(type, drug.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
      {drugs.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">No drugs added</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Anesthesia Type & Plan */}
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
              <Label>Anesthesia Type *</Label>
              <Select
                value={formData.anesthesia_type}
                onValueChange={(value) => updateFormData('anesthesia_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {anesthesiaTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Anesthesia Plan</Label>
            <Textarea
              placeholder="Detailed anesthesia plan..."
              value={formData.anesthesia_plan}
              onChange={(e) => updateFormData('anesthesia_plan', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Anesthesia Start</Label>
              <Input
                type="time"
                value={formData.anesthesia_start_time}
                onChange={(e) => updateFormData('anesthesia_start_time', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Induction Time</Label>
              <Input
                type="time"
                value={formData.induction_time}
                onChange={(e) => updateFormData('induction_time', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Intubation Time</Label>
              <Input
                type="time"
                value={formData.intubation_time}
                onChange={(e) => updateFormData('intubation_time', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Extubation Time</Label>
              <Input
                type="time"
                value={formData.extubation_time}
                onChange={(e) => updateFormData('extubation_time', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Anesthesia End</Label>
              <Input
                type="time"
                value={formData.anesthesia_end_time}
                onChange={(e) => updateFormData('anesthesia_end_time', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Airway Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Airway Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Airway Device</Label>
              <Select
                value={formData.airway_device}
                onValueChange={(value) => updateFormData('airway_device', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  {airwayDevices.map(device => (
                    <SelectItem key={device} value={device}>{device}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Size</Label>
              <Input
                placeholder="e.g., 7.5"
                value={formData.airway_size}
                onChange={(e) => updateFormData('airway_size', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Intubation Grade</Label>
              <Select
                value={formData.intubation_grade}
                onValueChange={(value) => updateFormData('intubation_grade', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">Grade I</SelectItem>
                  <SelectItem value="II">Grade II</SelectItem>
                  <SelectItem value="III">Grade III</SelectItem>
                  <SelectItem value="IV">Grade IV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Attempts</Label>
              <Input
                type="number"
                min="1"
                value={formData.intubation_attempts}
                onChange={(e) => updateFormData('intubation_attempts', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Label>Airway Complications</Label>
            <Textarea
              placeholder="Any airway-related complications..."
              value={formData.airway_complications}
              onChange={(e) => updateFormData('airway_complications', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Drugs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Syringe className="h-5 w-5" />
            Medications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <DrugList drugs={inductionDrugs} type="induction" title="Induction Agents" />
          <Separator />
          <DrugList drugs={maintenanceDrugs} type="maintenance" title="Maintenance Agents" />
          <Separator />
          <DrugList drugs={muscleRelaxants} type="relaxant" title="Muscle Relaxants" />
        </CardContent>
      </Card>

      {/* Vitals Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Intra-Op Vitals Log
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addVitalEntry}>
              <Plus className="h-4 w-4 mr-1" /> Add Reading
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {vitalsLog.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground px-2">
                <span>Time</span>
                <span>BP (Sys)</span>
                <span>BP (Dia)</span>
                <span>Pulse</span>
                <span>SpO2</span>
                <span>EtCO2</span>
                <span></span>
              </div>
              {vitalsLog.map(vital => (
                <div key={vital.id} className="grid grid-cols-7 gap-2 items-center">
                  <Input
                    type="time"
                    value={vital.time}
                    onChange={(e) => updateVital(vital.id, 'time', e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="120"
                    value={vital.bp_systolic}
                    onChange={(e) => updateVital(vital.id, 'bp_systolic', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="80"
                    value={vital.bp_diastolic}
                    onChange={(e) => updateVital(vital.id, 'bp_diastolic', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="72"
                    value={vital.pulse}
                    onChange={(e) => updateVital(vital.id, 'pulse', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="98"
                    value={vital.spo2}
                    onChange={(e) => updateVital(vital.id, 'spo2', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="35"
                    value={vital.etco2}
                    onChange={(e) => updateVital(vital.id, 'etco2', e.target.value)}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeVital(vital.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No vitals recorded. Click "Add Reading" to start logging.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Fluid Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Fluid Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Total Input (ml)</Label>
              <Input
                type="number"
                placeholder="e.g., 1500"
                value={formData.total_input_ml}
                onChange={(e) => updateFormData('total_input_ml', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Urine Output (ml)</Label>
              <Input
                type="number"
                placeholder="e.g., 400"
                value={formData.urine_output_ml}
                onChange={(e) => updateFormData('urine_output_ml', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Estimated Blood Loss (ml)</Label>
              <Input
                type="number"
                placeholder="e.g., 200"
                value={formData.blood_loss_ml}
                onChange={(e) => updateFormData('blood_loss_ml', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complications & Handover */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Complications & Handover</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Complications</Label>
            <Textarea
              placeholder="Any intra-operative complications..."
              value={formData.complications}
              onChange={(e) => updateFormData('complications', e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Recovery Score (Aldrete)</Label>
              <Input
                type="number"
                min="0"
                max="10"
                placeholder="0-10"
                value={formData.recovery_score}
                onChange={(e) => updateFormData('recovery_score', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Handover Notes (to PACU)</Label>
            <Textarea
              placeholder="Important notes for PACU handover..."
              value={formData.handover_notes}
              onChange={(e) => updateFormData('handover_notes', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || !formData.anesthesia_type}>
          {record ? 'Update Record' : 'Save Anesthesia Record'}
        </Button>
      </div>
    </form>
  );
}

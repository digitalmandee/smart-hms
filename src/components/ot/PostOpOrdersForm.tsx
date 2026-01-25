import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  usePostOpOrders,
  useCreatePostOpOrder,
  useUpdatePostOpOrder,
  DIET_OPTIONS,
  ACTIVITY_OPTIONS,
  VITAL_FREQUENCY_OPTIONS,
  VTE_OPTIONS,
} from '@/hooks/usePostOpOrders';
import { format } from 'date-fns';
import {
  ClipboardList,
  Save,
  RefreshCw,
  Check,
  AlertCircle,
} from 'lucide-react';

interface PostOpOrdersFormProps {
  surgeryId: string;
  onSuccess?: () => void;
}

interface FormData {
  disposition: string;
  diet_order: string;
  diet_notes: string;
  activity_level: string;
  activity_restrictions: string;
  weight_bearing: string;
  vital_signs_frequency: string;
  pain_management_text: string;
  iv_fluids_text: string;
  medications_text: string;
  continue_home_meds: boolean;
  held_medications: string;
  foley_catheter: boolean;
  foley_removal_date: string;
  ng_tube: boolean;
  ng_tube_orders: string;
  drains_text: string;
  vte_prophylaxis: string;
  vte_medication_details: string;
  wound_care_instructions: string;
  dressing_change_frequency: string;
  incentive_spirometry: boolean;
  oxygen_therapy: string;
  respiratory_treatments: string;
  stat_labs_text: string;
  morning_labs_text: string;
  imaging_orders: string;
  consults_text: string;
  special_instructions: string;
  follow_up_instructions: string;
  follow_up_appointment: string;
  discharge_criteria: string;
  code_status: string;
  neuro_checks: boolean;
  neuro_frequency: string;
  intake_output: boolean;
  fall_precautions: boolean;
  bleeding_precautions: boolean;
  pain_goal: number | null;
  pca_ordered: boolean;
}

const INITIAL_FORM: FormData = {
  disposition: 'ward',
  diet_order: 'npo',
  diet_notes: '',
  activity_level: 'bed_rest',
  activity_restrictions: '',
  weight_bearing: '',
  vital_signs_frequency: 'q4h',
  pain_management_text: '',
  iv_fluids_text: '',
  medications_text: '',
  continue_home_meds: false,
  held_medications: '',
  foley_catheter: false,
  foley_removal_date: '',
  ng_tube: false,
  ng_tube_orders: '',
  drains_text: '',
  vte_prophylaxis: 'scds',
  vte_medication_details: '',
  wound_care_instructions: '',
  dressing_change_frequency: '',
  incentive_spirometry: false,
  oxygen_therapy: '',
  respiratory_treatments: '',
  stat_labs_text: '',
  morning_labs_text: '',
  imaging_orders: '',
  consults_text: '',
  special_instructions: '',
  follow_up_instructions: '',
  follow_up_appointment: '',
  discharge_criteria: '',
  code_status: 'full_code',
  neuro_checks: false,
  neuro_frequency: '',
  intake_output: true,
  fall_precautions: false,
  bleeding_precautions: false,
  pain_goal: null,
  pca_ordered: false,
};

const DISPOSITION_OPTIONS = [
  { value: 'ward', label: 'Ward' },
  { value: 'icu', label: 'ICU' },
  { value: 'pacu', label: 'PACU/Recovery' },
  { value: 'observation', label: 'Observation' },
  { value: 'home', label: 'Home (Same-day discharge)' },
];

const CODE_STATUS_OPTIONS = [
  { value: 'full_code', label: 'Full Code' },
  { value: 'dnr', label: 'DNR' },
  { value: 'dni', label: 'DNI' },
  { value: 'dnr_dni', label: 'DNR/DNI' },
  { value: 'comfort', label: 'Comfort Care Only' },
];

// Helper to safely convert Json arrays to string
const jsonArrayToString = (val: unknown): string => {
  if (!val) return '';
  if (Array.isArray(val)) {
    return val.join(', ');
  }
  if (typeof val === 'string') return val;
  return '';
};

// Helper to safely stringify Json object arrays for display
const jsonToText = (val: unknown): string => {
  if (!val) return '';
  if (Array.isArray(val)) {
    return val.map((item) => {
      if (typeof item === 'object' && item !== null) {
        return Object.values(item).filter(Boolean).join(' ');
      }
      return String(item);
    }).join('\n');
  }
  if (typeof val === 'string') return val;
  return '';
};

export function PostOpOrdersForm({ surgeryId, onSuccess }: PostOpOrdersFormProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: existingOrder, isLoading } = usePostOpOrders(surgeryId);
  const createOrder = useCreatePostOpOrder();
  const updateOrder = useUpdatePostOpOrder();

  // Populate form from existing order
  useEffect(() => {
    if (existingOrder) {
      setFormData({
        disposition: existingOrder.disposition || 'ward',
        diet_order: existingOrder.diet_order || 'npo',
        diet_notes: existingOrder.diet_notes || '',
        activity_level: existingOrder.activity_level || 'bed_rest',
        activity_restrictions: existingOrder.activity_restrictions || '',
        weight_bearing: existingOrder.weight_bearing || '',
        vital_signs_frequency: existingOrder.vital_signs_frequency || 'q4h',
        pain_management_text: jsonToText(existingOrder.pain_management),
        iv_fluids_text: jsonToText(existingOrder.iv_fluids),
        medications_text: jsonToText(existingOrder.medications),
        continue_home_meds: existingOrder.continue_home_meds || false,
        held_medications: existingOrder.held_medications || '',
        foley_catheter: existingOrder.foley_catheter || false,
        foley_removal_date: existingOrder.foley_removal_date
          ? format(new Date(existingOrder.foley_removal_date), 'yyyy-MM-dd')
          : '',
        ng_tube: existingOrder.ng_tube || false,
        ng_tube_orders: existingOrder.ng_tube_orders || '',
        drains_text: jsonToText(existingOrder.drains),
        vte_prophylaxis: existingOrder.vte_prophylaxis || 'scds',
        vte_medication_details: existingOrder.vte_medication_details || '',
        wound_care_instructions: existingOrder.wound_care_instructions || '',
        dressing_change_frequency: existingOrder.dressing_change_frequency || '',
        incentive_spirometry: existingOrder.incentive_spirometry || false,
        oxygen_therapy: existingOrder.oxygen_therapy || '',
        respiratory_treatments: existingOrder.respiratory_treatments || '',
        stat_labs_text: jsonArrayToString(existingOrder.stat_labs),
        morning_labs_text: jsonArrayToString(existingOrder.morning_labs),
        imaging_orders: existingOrder.imaging_orders || '',
        consults_text: jsonArrayToString(existingOrder.consults),
        special_instructions: existingOrder.special_instructions || '',
        follow_up_instructions: existingOrder.follow_up_instructions || '',
        follow_up_appointment: existingOrder.follow_up_appointment
          ? format(new Date(existingOrder.follow_up_appointment), 'yyyy-MM-dd')
          : '',
        discharge_criteria: existingOrder.discharge_criteria || '',
        code_status: existingOrder.code_status || 'full_code',
        neuro_checks: existingOrder.neuro_checks || false,
        neuro_frequency: existingOrder.neuro_frequency || '',
        intake_output: existingOrder.intake_output ?? true,
        fall_precautions: existingOrder.fall_precautions || false,
        bleeding_precautions: existingOrder.bleeding_precautions || false,
        pain_goal: existingOrder.pain_goal ?? null,
        pca_ordered: existingOrder.pca_ordered || false,
      });
      setHasChanges(false);
    }
  }, [existingOrder]);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Parse text fields back to arrays where needed
      const statLabs = formData.stat_labs_text
        ? formData.stat_labs_text.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined;
      const morningLabs = formData.morning_labs_text
        ? formData.morning_labs_text.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined;
      const consults = formData.consults_text
        ? formData.consults_text.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined;

      if (existingOrder) {
        await updateOrder.mutateAsync({
          id: existingOrder.id,
          surgeryId,
          disposition: formData.disposition,
          diet_order: formData.diet_order,
          diet_notes: formData.diet_notes || null,
          activity_level: formData.activity_level,
          activity_restrictions: formData.activity_restrictions || null,
          weight_bearing: formData.weight_bearing || null,
          vital_signs_frequency: formData.vital_signs_frequency,
          held_medications: formData.held_medications || null,
          continue_home_meds: formData.continue_home_meds,
          foley_catheter: formData.foley_catheter,
          foley_removal_date: formData.foley_removal_date || null,
          ng_tube: formData.ng_tube,
          ng_tube_orders: formData.ng_tube_orders || null,
          vte_prophylaxis: formData.vte_prophylaxis || null,
          vte_medication_details: formData.vte_medication_details || null,
          wound_care_instructions: formData.wound_care_instructions || null,
          dressing_change_frequency: formData.dressing_change_frequency || null,
          incentive_spirometry: formData.incentive_spirometry,
          oxygen_therapy: formData.oxygen_therapy || null,
          respiratory_treatments: formData.respiratory_treatments || null,
          stat_labs: statLabs || null,
          morning_labs: morningLabs || null,
          imaging_orders: formData.imaging_orders || null,
          consults: consults || null,
          special_instructions: formData.special_instructions || null,
          follow_up_instructions: formData.follow_up_instructions || null,
          follow_up_appointment: formData.follow_up_appointment || null,
          discharge_criteria: formData.discharge_criteria || null,
          code_status: formData.code_status,
          neuro_checks: formData.neuro_checks,
          neuro_frequency: formData.neuro_frequency || null,
          intake_output: formData.intake_output,
          fall_precautions: formData.fall_precautions,
          bleeding_precautions: formData.bleeding_precautions,
          pain_goal: formData.pain_goal,
          pca_ordered: formData.pca_ordered,
        });
      } else {
        await createOrder.mutateAsync({
          surgery_id: surgeryId,
          disposition: formData.disposition,
          diet_order: formData.diet_order,
          diet_notes: formData.diet_notes || undefined,
          activity_level: formData.activity_level,
          activity_restrictions: formData.activity_restrictions || undefined,
          weight_bearing: formData.weight_bearing || undefined,
          vital_signs_frequency: formData.vital_signs_frequency,
          held_medications: formData.held_medications || undefined,
          continue_home_meds: formData.continue_home_meds,
          foley_catheter: formData.foley_catheter,
          foley_removal_date: formData.foley_removal_date || undefined,
          ng_tube: formData.ng_tube,
          ng_tube_orders: formData.ng_tube_orders || undefined,
          vte_prophylaxis: formData.vte_prophylaxis || undefined,
          vte_medication_details: formData.vte_medication_details || undefined,
          wound_care_instructions: formData.wound_care_instructions || undefined,
          dressing_change_frequency: formData.dressing_change_frequency || undefined,
          incentive_spirometry: formData.incentive_spirometry,
          oxygen_therapy: formData.oxygen_therapy || undefined,
          respiratory_treatments: formData.respiratory_treatments || undefined,
          stat_labs: statLabs,
          morning_labs: morningLabs,
          imaging_orders: formData.imaging_orders || undefined,
          consults: consults,
          special_instructions: formData.special_instructions || undefined,
          follow_up_instructions: formData.follow_up_instructions || undefined,
          follow_up_appointment: formData.follow_up_appointment || undefined,
          discharge_criteria: formData.discharge_criteria || undefined,
          code_status: formData.code_status,
          neuro_checks: formData.neuro_checks,
          neuro_frequency: formData.neuro_frequency || undefined,
          intake_output: formData.intake_output,
          fall_precautions: formData.fall_precautions,
          bleeding_precautions: formData.bleeding_precautions,
          pain_goal: formData.pain_goal ?? undefined,
          pca_ordered: formData.pca_ordered,
        });
      }
      setHasChanges(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleReset = () => {
    if (existingOrder) {
      setFormData({
        disposition: existingOrder.disposition || 'ward',
        diet_order: existingOrder.diet_order || 'npo',
        diet_notes: existingOrder.diet_notes || '',
        activity_level: existingOrder.activity_level || 'bed_rest',
        activity_restrictions: existingOrder.activity_restrictions || '',
        weight_bearing: existingOrder.weight_bearing || '',
        vital_signs_frequency: existingOrder.vital_signs_frequency || 'q4h',
        pain_management_text: jsonToText(existingOrder.pain_management),
        iv_fluids_text: jsonToText(existingOrder.iv_fluids),
        medications_text: jsonToText(existingOrder.medications),
        continue_home_meds: existingOrder.continue_home_meds || false,
        held_medications: existingOrder.held_medications || '',
        foley_catheter: existingOrder.foley_catheter || false,
        foley_removal_date: existingOrder.foley_removal_date
          ? format(new Date(existingOrder.foley_removal_date), 'yyyy-MM-dd')
          : '',
        ng_tube: existingOrder.ng_tube || false,
        ng_tube_orders: existingOrder.ng_tube_orders || '',
        drains_text: jsonToText(existingOrder.drains),
        vte_prophylaxis: existingOrder.vte_prophylaxis || 'scds',
        vte_medication_details: existingOrder.vte_medication_details || '',
        wound_care_instructions: existingOrder.wound_care_instructions || '',
        dressing_change_frequency: existingOrder.dressing_change_frequency || '',
        incentive_spirometry: existingOrder.incentive_spirometry || false,
        oxygen_therapy: existingOrder.oxygen_therapy || '',
        respiratory_treatments: existingOrder.respiratory_treatments || '',
        stat_labs_text: jsonArrayToString(existingOrder.stat_labs),
        morning_labs_text: jsonArrayToString(existingOrder.morning_labs),
        imaging_orders: existingOrder.imaging_orders || '',
        consults_text: jsonArrayToString(existingOrder.consults),
        special_instructions: existingOrder.special_instructions || '',
        follow_up_instructions: existingOrder.follow_up_instructions || '',
        follow_up_appointment: existingOrder.follow_up_appointment
          ? format(new Date(existingOrder.follow_up_appointment), 'yyyy-MM-dd')
          : '',
        discharge_criteria: existingOrder.discharge_criteria || '',
        code_status: existingOrder.code_status || 'full_code',
        neuro_checks: existingOrder.neuro_checks || false,
        neuro_frequency: existingOrder.neuro_frequency || '',
        intake_output: existingOrder.intake_output ?? true,
        fall_precautions: existingOrder.fall_precautions || false,
        bleeding_precautions: existingOrder.bleeding_precautions || false,
        pain_goal: existingOrder.pain_goal ?? null,
        pca_ordered: existingOrder.pca_ordered || false,
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setHasChanges(false);
  };

  if (isLoading) {
    return <p className="text-muted-foreground text-sm p-4">Loading post-op orders...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Post-Operative Orders
          </h3>
          {existingOrder && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Check className="h-3 w-3 text-green-600" />
              Last updated {format(new Date(existingOrder.updated_at), 'PPp')}
              {existingOrder.ordered_by_profile?.full_name &&
                ` by ${existingOrder.ordered_by_profile.full_name}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || createOrder.isPending || updateOrder.isPending}
          >
            <Save className="h-4 w-4 mr-1" />
            {createOrder.isPending || updateOrder.isPending ? 'Saving...' : 'Save Orders'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded text-sm">
          <AlertCircle className="h-4 w-4" />
          You have unsaved changes
        </div>
      )}

      {/* Form Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Disposition & General */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Disposition & General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Disposition *</Label>
              <Select
                value={formData.disposition}
                onValueChange={(v) => updateField('disposition', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISPOSITION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Code Status</Label>
              <Select
                value={formData.code_status}
                onValueChange={(v) => updateField('code_status', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CODE_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Vital Signs Frequency</Label>
              <Select
                value={formData.vital_signs_frequency}
                onValueChange={(v) => updateField('vital_signs_frequency', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VITAL_FREQUENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Follow-up Appointment</Label>
              <Input
                type="date"
                value={formData.follow_up_appointment}
                onChange={(e) => updateField('follow_up_appointment', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Diet & Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Diet & Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Diet</Label>
              <Select value={formData.diet_order} onValueChange={(v) => updateField('diet_order', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIET_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Diet Notes</Label>
              <Input
                value={formData.diet_notes}
                onChange={(e) => updateField('diet_notes', e.target.value)}
                placeholder="Additional diet instructions..."
              />
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label>Activity Level</Label>
              <Select
                value={formData.activity_level}
                onValueChange={(v) => updateField('activity_level', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Activity Restrictions</Label>
              <Input
                value={formData.activity_restrictions}
                onChange={(e) => updateField('activity_restrictions', e.target.value)}
                placeholder="Activity restrictions or requirements..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Weight Bearing</Label>
              <Input
                value={formData.weight_bearing}
                onChange={(e) => updateField('weight_bearing', e.target.value)}
                placeholder="e.g., Non-weight bearing right leg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pain Management */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pain Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Pain Management Orders</Label>
              <Textarea
                value={formData.pain_management_text}
                onChange={(e) => updateField('pain_management_text', e.target.value)}
                placeholder="Pain medications and dosing schedule..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Pain Goal (0-10)</Label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={formData.pain_goal ?? ''}
                  onChange={(e) => updateField('pain_goal', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="e.g., 4"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="pca"
                  checked={formData.pca_ordered}
                  onCheckedChange={(checked) => updateField('pca_ordered', checked as boolean)}
                />
                <Label htmlFor="pca" className="font-normal">PCA Ordered</Label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>IV Fluids</Label>
              <Textarea
                value={formData.iv_fluids_text}
                onChange={(e) => updateField('iv_fluids_text', e.target.value)}
                placeholder="e.g., NS 100ml/hr, D5 1/2NS 75ml/hr..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Medications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Medications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="continue_home"
                checked={formData.continue_home_meds}
                onCheckedChange={(checked) => updateField('continue_home_meds', checked as boolean)}
              />
              <Label htmlFor="continue_home" className="font-normal">
                Continue Home Medications
              </Label>
            </div>
            <div className="space-y-1.5">
              <Label>Hold Medications</Label>
              <Textarea
                value={formData.held_medications}
                onChange={(e) => updateField('held_medications', e.target.value)}
                placeholder="Medications to hold..."
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>New/Additional Medications</Label>
              <Textarea
                value={formData.medications_text}
                onChange={(e) => updateField('medications_text', e.target.value)}
                placeholder="New medications ordered..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Drains & Catheters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Drains & Catheters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="foley"
                checked={formData.foley_catheter}
                onCheckedChange={(checked) => updateField('foley_catheter', checked as boolean)}
              />
              <Label htmlFor="foley" className="font-normal">
                Foley Catheter
              </Label>
            </div>
            {formData.foley_catheter && (
              <div className="space-y-1.5 ml-6">
                <Label>Foley Removal Date</Label>
                <Input
                  type="date"
                  value={formData.foley_removal_date}
                  onChange={(e) => updateField('foley_removal_date', e.target.value)}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ng"
                checked={formData.ng_tube}
                onCheckedChange={(checked) => updateField('ng_tube', checked as boolean)}
              />
              <Label htmlFor="ng" className="font-normal">
                NG Tube
              </Label>
            </div>
            {formData.ng_tube && (
              <div className="space-y-1.5 ml-6">
                <Label>NG Tube Orders</Label>
                <Input
                  value={formData.ng_tube_orders}
                  onChange={(e) => updateField('ng_tube_orders', e.target.value)}
                  placeholder="e.g., Low intermittent suction"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Other Drains</Label>
              <Textarea
                value={formData.drains_text}
                onChange={(e) => updateField('drains_text', e.target.value)}
                placeholder="JP drains, chest tubes, etc..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="io"
                checked={formData.intake_output}
                onCheckedChange={(checked) => updateField('intake_output', checked as boolean)}
              />
              <Label htmlFor="io" className="font-normal">
                Strict I&O Monitoring
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* VTE & Wound Care */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">VTE & Wound Care</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>VTE Prophylaxis</Label>
              <Select
                value={formData.vte_prophylaxis}
                onValueChange={(v) => updateField('vte_prophylaxis', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VTE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>VTE Medication Details</Label>
              <Input
                value={formData.vte_medication_details}
                onChange={(e) => updateField('vte_medication_details', e.target.value)}
                placeholder="Specific dosing if applicable..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Wound Care Instructions</Label>
              <Textarea
                value={formData.wound_care_instructions}
                onChange={(e) => updateField('wound_care_instructions', e.target.value)}
                placeholder="Wound care instructions..."
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Dressing Change Frequency</Label>
              <Input
                value={formData.dressing_change_frequency}
                onChange={(e) => updateField('dressing_change_frequency', e.target.value)}
                placeholder="e.g., Daily, Every other day"
              />
            </div>
          </CardContent>
        </Card>

        {/* Respiratory & Neuro */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Respiratory & Neuro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="incentive"
                checked={formData.incentive_spirometry}
                onCheckedChange={(checked) => updateField('incentive_spirometry', checked as boolean)}
              />
              <Label htmlFor="incentive" className="font-normal">
                Incentive Spirometry
              </Label>
            </div>

            <div className="space-y-1.5">
              <Label>Oxygen Therapy</Label>
              <Input
                value={formData.oxygen_therapy}
                onChange={(e) => updateField('oxygen_therapy', e.target.value)}
                placeholder="e.g., 2L NC, Room air"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Respiratory Treatments</Label>
              <Input
                value={formData.respiratory_treatments}
                onChange={(e) => updateField('respiratory_treatments', e.target.value)}
                placeholder="Nebulizers, etc."
              />
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="neuro"
                checked={formData.neuro_checks}
                onCheckedChange={(checked) => updateField('neuro_checks', checked as boolean)}
              />
              <Label htmlFor="neuro" className="font-normal">
                Neuro Checks Required
              </Label>
            </div>
            {formData.neuro_checks && (
              <div className="space-y-1.5 ml-6">
                <Label>Neuro Check Frequency</Label>
                <Input
                  value={formData.neuro_frequency}
                  onChange={(e) => updateField('neuro_frequency', e.target.value)}
                  placeholder="e.g., q1h x 4, then q2h"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Safety Precautions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Safety Precautions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fall"
                checked={formData.fall_precautions}
                onCheckedChange={(checked) => updateField('fall_precautions', checked as boolean)}
              />
              <Label htmlFor="fall" className="font-normal">
                Fall Precautions
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="bleeding"
                checked={formData.bleeding_precautions}
                onCheckedChange={(checked) => updateField('bleeding_precautions', checked as boolean)}
              />
              <Label htmlFor="bleeding" className="font-normal">
                Bleeding Precautions
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Labs & Imaging */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Labs & Imaging</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Stat Labs (comma-separated)</Label>
              <Input
                value={formData.stat_labs_text}
                onChange={(e) => updateField('stat_labs_text', e.target.value)}
                placeholder="e.g., CBC, BMP, PT/INR"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Morning Labs (comma-separated)</Label>
              <Input
                value={formData.morning_labs_text}
                onChange={(e) => updateField('morning_labs_text', e.target.value)}
                placeholder="Labs to be drawn in AM"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Imaging Orders</Label>
              <Input
                value={formData.imaging_orders}
                onChange={(e) => updateField('imaging_orders', e.target.value)}
                placeholder="e.g., CXR portable in AM"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Consults (comma-separated)</Label>
              <Input
                value={formData.consults_text}
                onChange={(e) => updateField('consults_text', e.target.value)}
                placeholder="e.g., PT, OT, Social Work"
              />
            </div>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Instructions & Discharge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Special Instructions</Label>
              <Textarea
                value={formData.special_instructions}
                onChange={(e) => updateField('special_instructions', e.target.value)}
                placeholder="Any other special instructions..."
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Discharge Criteria</Label>
              <Textarea
                value={formData.discharge_criteria}
                onChange={(e) => updateField('discharge_criteria', e.target.value)}
                placeholder="Criteria for discharge..."
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Follow-up Instructions</Label>
              <Textarea
                value={formData.follow_up_instructions}
                onChange={(e) => updateField('follow_up_instructions', e.target.value)}
                placeholder="Follow-up appointment instructions..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

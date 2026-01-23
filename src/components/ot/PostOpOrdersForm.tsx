import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  type PostOpOrder,
} from '@/hooks/usePostOpOrders';
import { format } from 'date-fns';
import {
  ClipboardList,
  Save,
  RefreshCw,
  User,
  Check,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface PostOpOrdersFormProps {
  surgeryId: string;
}

interface FormData {
  disposition: string;
  diet: string;
  diet_instructions: string;
  activity: string;
  activity_instructions: string;
  vital_signs_frequency: string;
  pain_management: string;
  iv_fluids: string;
  iv_fluid_rate: string;
  medications_to_continue: string;
  medications_to_hold: string;
  new_medications: string;
  foley_catheter: boolean;
  foley_instructions: string;
  ng_tube: boolean;
  ng_tube_instructions: string;
  drains: string;
  vte_prophylaxis: string;
  wound_care: string;
  dressing_change_frequency: string;
  stat_labs: string;
  morning_labs: string;
  imaging_orders: string;
  notify_doctor_if: string;
  special_instructions: string;
  follow_up_instructions: string;
  follow_up_date: string;
  estimated_discharge: string;
}

const INITIAL_FORM: FormData = {
  disposition: 'ward',
  diet: 'npo',
  diet_instructions: '',
  activity: 'bed_rest',
  activity_instructions: '',
  vital_signs_frequency: 'q4h',
  pain_management: '',
  iv_fluids: '',
  iv_fluid_rate: '',
  medications_to_continue: '',
  medications_to_hold: '',
  new_medications: '',
  foley_catheter: false,
  foley_instructions: '',
  ng_tube: false,
  ng_tube_instructions: '',
  drains: '',
  vte_prophylaxis: 'scds',
  wound_care: '',
  dressing_change_frequency: '',
  stat_labs: '',
  morning_labs: '',
  imaging_orders: '',
  notify_doctor_if: '',
  special_instructions: '',
  follow_up_instructions: '',
  follow_up_date: '',
  estimated_discharge: '',
};

const DISPOSITION_OPTIONS = [
  { value: 'ward', label: 'Ward' },
  { value: 'icu', label: 'ICU' },
  { value: 'pacu', label: 'PACU/Recovery' },
  { value: 'observation', label: 'Observation' },
  { value: 'home', label: 'Home (Same-day discharge)' },
];

export function PostOpOrdersForm({ surgeryId }: PostOpOrdersFormProps) {
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
        diet: existingOrder.diet || 'npo',
        diet_instructions: existingOrder.diet_instructions || '',
        activity: existingOrder.activity || 'bed_rest',
        activity_instructions: existingOrder.activity_instructions || '',
        vital_signs_frequency: existingOrder.vital_signs_frequency || 'q4h',
        pain_management: existingOrder.pain_management || '',
        iv_fluids: existingOrder.iv_fluids || '',
        iv_fluid_rate: existingOrder.iv_fluid_rate || '',
        medications_to_continue: existingOrder.medications_to_continue || '',
        medications_to_hold: existingOrder.medications_to_hold || '',
        new_medications: existingOrder.new_medications || '',
        foley_catheter: existingOrder.foley_catheter || false,
        foley_instructions: existingOrder.foley_instructions || '',
        ng_tube: existingOrder.ng_tube || false,
        ng_tube_instructions: existingOrder.ng_tube_instructions || '',
        drains: existingOrder.drains || '',
        vte_prophylaxis: existingOrder.vte_prophylaxis || 'scds',
        wound_care: existingOrder.wound_care || '',
        dressing_change_frequency: existingOrder.dressing_change_frequency || '',
        stat_labs: existingOrder.stat_labs || '',
        morning_labs: existingOrder.morning_labs || '',
        imaging_orders: existingOrder.imaging_orders || '',
        notify_doctor_if: existingOrder.notify_doctor_if || '',
        special_instructions: existingOrder.special_instructions || '',
        follow_up_instructions: existingOrder.follow_up_instructions || '',
        follow_up_date: existingOrder.follow_up_date
          ? format(new Date(existingOrder.follow_up_date), 'yyyy-MM-dd')
          : '',
        estimated_discharge: existingOrder.estimated_discharge
          ? format(new Date(existingOrder.estimated_discharge), 'yyyy-MM-dd')
          : '',
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
      if (existingOrder) {
        await updateOrder.mutateAsync({
          id: existingOrder.id,
          surgeryId,
          ...formData,
          follow_up_date: formData.follow_up_date || null,
          estimated_discharge: formData.estimated_discharge || null,
        });
      } else {
        await createOrder.mutateAsync({
          surgery_id: surgeryId,
          ...formData,
          follow_up_date: formData.follow_up_date || undefined,
          estimated_discharge: formData.estimated_discharge || undefined,
        });
      }
      setHasChanges(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleReset = () => {
    if (existingOrder) {
      setFormData({
        disposition: existingOrder.disposition || 'ward',
        diet: existingOrder.diet || 'npo',
        diet_instructions: existingOrder.diet_instructions || '',
        activity: existingOrder.activity || 'bed_rest',
        activity_instructions: existingOrder.activity_instructions || '',
        vital_signs_frequency: existingOrder.vital_signs_frequency || 'q4h',
        pain_management: existingOrder.pain_management || '',
        iv_fluids: existingOrder.iv_fluids || '',
        iv_fluid_rate: existingOrder.iv_fluid_rate || '',
        medications_to_continue: existingOrder.medications_to_continue || '',
        medications_to_hold: existingOrder.medications_to_hold || '',
        new_medications: existingOrder.new_medications || '',
        foley_catheter: existingOrder.foley_catheter || false,
        foley_instructions: existingOrder.foley_instructions || '',
        ng_tube: existingOrder.ng_tube || false,
        ng_tube_instructions: existingOrder.ng_tube_instructions || '',
        drains: existingOrder.drains || '',
        vte_prophylaxis: existingOrder.vte_prophylaxis || 'scds',
        wound_care: existingOrder.wound_care || '',
        dressing_change_frequency: existingOrder.dressing_change_frequency || '',
        stat_labs: existingOrder.stat_labs || '',
        morning_labs: existingOrder.morning_labs || '',
        imaging_orders: existingOrder.imaging_orders || '',
        notify_doctor_if: existingOrder.notify_doctor_if || '',
        special_instructions: existingOrder.special_instructions || '',
        follow_up_instructions: existingOrder.follow_up_instructions || '',
        follow_up_date: existingOrder.follow_up_date
          ? format(new Date(existingOrder.follow_up_date), 'yyyy-MM-dd')
          : '',
        estimated_discharge: existingOrder.estimated_discharge
          ? format(new Date(existingOrder.estimated_discharge), 'yyyy-MM-dd')
          : '',
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Estimated Discharge</Label>
                <Input
                  type="date"
                  value={formData.estimated_discharge}
                  onChange={(e) => updateField('estimated_discharge', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Follow-up Date</Label>
                <Input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => updateField('follow_up_date', e.target.value)}
                />
              </div>
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
              <Select value={formData.diet} onValueChange={(v) => updateField('diet', v)}>
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
              <Label>Diet Instructions</Label>
              <Input
                value={formData.diet_instructions}
                onChange={(e) => updateField('diet_instructions', e.target.value)}
                placeholder="Additional diet instructions..."
              />
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label>Activity</Label>
              <Select
                value={formData.activity}
                onValueChange={(v) => updateField('activity', v)}
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
              <Label>Activity Instructions</Label>
              <Input
                value={formData.activity_instructions}
                onChange={(e) => updateField('activity_instructions', e.target.value)}
                placeholder="Activity restrictions or requirements..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Pain & IV */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pain Management & IV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Pain Management</Label>
              <Textarea
                value={formData.pain_management}
                onChange={(e) => updateField('pain_management', e.target.value)}
                placeholder="Pain medications and dosing schedule..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>IV Fluids</Label>
                <Input
                  value={formData.iv_fluids}
                  onChange={(e) => updateField('iv_fluids', e.target.value)}
                  placeholder="e.g., NS, D5NS, LR"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Rate</Label>
                <Input
                  value={formData.iv_fluid_rate}
                  onChange={(e) => updateField('iv_fluid_rate', e.target.value)}
                  placeholder="e.g., 100 ml/hr"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Medications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Continue Home Medications</Label>
              <Textarea
                value={formData.medications_to_continue}
                onChange={(e) => updateField('medications_to_continue', e.target.value)}
                placeholder="List medications to continue..."
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Hold Medications</Label>
              <Textarea
                value={formData.medications_to_hold}
                onChange={(e) => updateField('medications_to_hold', e.target.value)}
                placeholder="List medications to hold..."
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>New Medications</Label>
              <Textarea
                value={formData.new_medications}
                onChange={(e) => updateField('new_medications', e.target.value)}
                placeholder="New medications ordered..."
                rows={2}
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
                onCheckedChange={(checked) =>
                  updateField('foley_catheter', checked as boolean)
                }
              />
              <Label htmlFor="foley" className="font-normal">
                Foley Catheter
              </Label>
            </div>
            {formData.foley_catheter && (
              <div className="space-y-1.5 ml-6">
                <Label>Foley Instructions</Label>
                <Input
                  value={formData.foley_instructions}
                  onChange={(e) => updateField('foley_instructions', e.target.value)}
                  placeholder="e.g., Monitor I&O, remove POD#1"
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
                <Label>NG Tube Instructions</Label>
                <Input
                  value={formData.ng_tube_instructions}
                  onChange={(e) => updateField('ng_tube_instructions', e.target.value)}
                  placeholder="e.g., Low intermittent suction"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Other Drains</Label>
              <Textarea
                value={formData.drains}
                onChange={(e) => updateField('drains', e.target.value)}
                placeholder="JP drains, chest tubes, etc..."
                rows={2}
              />
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
              <Label>Wound Care</Label>
              <Textarea
                value={formData.wound_care}
                onChange={(e) => updateField('wound_care', e.target.value)}
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

        {/* Labs & Imaging */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Labs & Imaging</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Stat Labs</Label>
              <Input
                value={formData.stat_labs}
                onChange={(e) => updateField('stat_labs', e.target.value)}
                placeholder="e.g., CBC, BMP, PT/INR"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Morning Labs</Label>
              <Input
                value={formData.morning_labs}
                onChange={(e) => updateField('morning_labs', e.target.value)}
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
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Special Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Notify Doctor If</Label>
              <Textarea
                value={formData.notify_doctor_if}
                onChange={(e) => updateField('notify_doctor_if', e.target.value)}
                placeholder="Conditions that require physician notification..."
                rows={3}
              />
            </div>
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

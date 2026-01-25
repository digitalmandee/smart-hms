import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useSurgeryMedications,
  useCreateMedication,
  useAdministerMedication,
  useHoldMedication,
  useCancelMedication,
  useDeleteMedication,
  useRequestPharmacyDispense,
  COMMON_PREOP_MEDICATIONS,
  type SurgeryMedication,
} from '@/hooks/useOTMedications';
import { MedicineSearchCombobox } from './MedicineSearchCombobox';
import { format } from 'date-fns';
import {
  Plus,
  Pill,
  Check,
  Pause,
  X,
  Trash2,
  Clock,
  User,
  Syringe,
  Package,
  Loader2,
} from 'lucide-react';
import { otLogger } from '@/lib/logger';

interface OTMedicationPanelProps {
  surgeryId: string;
}

type MedicationTiming = 'pre_op' | 'intra_op' | 'post_op';
type MedicationStatus = 'pending' | 'given' | 'held' | 'cancelled';

const TIMING_LABELS: Record<MedicationTiming, string> = {
  pre_op: 'Pre-Op',
  intra_op: 'Intra-Op',
  post_op: 'Post-Op',
};

const STATUS_CONFIG: Record<MedicationStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  given: { label: 'Given', variant: 'default' },
  held: { label: 'Held', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

const ROUTE_OPTIONS = [
  'IV',
  'IM',
  'PO',
  'SC',
  'Topical',
  'Inhalation',
  'Epidural',
  'Intrathecal',
];

export function OTMedicationPanel({ surgeryId }: OTMedicationPanelProps) {
  const [activeTab, setActiveTab] = useState<MedicationTiming>('pre_op');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [holdReason, setHoldReason] = useState('');

  const { data: medications, isLoading } = useSurgeryMedications(surgeryId);
  const createMedication = useCreateMedication();
  const administerMedication = useAdministerMedication();
  const requestPharmacy = useRequestPharmacyDispense();
  const holdMedication = useHoldMedication();
  const cancelMedication = useCancelMedication();
  const deleteMedication = useDeleteMedication();

  // Form state for custom medication
  const [customMed, setCustomMed] = useState({
    medication_name: '',
    dosage: '',
    route: 'IV',
    timing: 'pre_op' as MedicationTiming,
    notes: '',
    requestFromPharmacy: false,
  });

  const resetCustomForm = () => {
    setCustomMed({
      medication_name: '',
      dosage: '',
      route: 'IV',
      timing: 'pre_op',
      notes: '',
      requestFromPharmacy: false,
    });
  };

  const handleAddQuickMed = async (med: typeof COMMON_PREOP_MEDICATIONS[0], requestFromPharmacy = false) => {
    await createMedication.mutateAsync({
      surgery_id: surgeryId,
      medication_name: med.name,
      dosage: med.dosage,
      route: 'IV',
      timing: 'pre_op',
      notes: med.timing,
      pharmacy_status: requestFromPharmacy ? 'requested' : 'not_required',
    });
  };

  const handleAddCustomMed = async () => {
    if (!customMed.medication_name.trim()) return;

    await createMedication.mutateAsync({
      surgery_id: surgeryId,
      medication_name: customMed.medication_name,
      dosage: customMed.dosage,
      route: customMed.route,
      timing: customMed.timing,
      notes: customMed.notes,
      pharmacy_status: customMed.requestFromPharmacy ? 'requested' : 'not_required',
    });

    resetCustomForm();
    setIsAddDialogOpen(false);
  };

  const handleAdminister = async (med: SurgeryMedication) => {
    await administerMedication.mutateAsync({
      medicationId: med.id,
      surgeryId: surgeryId,
    });
  };

  const handleHold = async (med: SurgeryMedication) => {
    if (!holdReason.trim()) return;
    
    await holdMedication.mutateAsync({
      medicationId: med.id,
      surgeryId: surgeryId,
      reason: holdReason,
    });
    setHoldReason('');
  };

  const handleCancel = async (med: SurgeryMedication) => {
    await cancelMedication.mutateAsync({
      medicationId: med.id,
      surgeryId: surgeryId,
    });
  };

  const handleDelete = async (med: SurgeryMedication) => {
    await deleteMedication.mutateAsync({
      medicationId: med.id,
      surgeryId: surgeryId,
    });
  };

  const getMedicationsByTiming = (timing: MedicationTiming) => {
    return medications?.filter((m) => m.timing === timing) || [];
  };

  const getStats = () => {
    if (!medications) return { pending: 0, given: 0, held: 0 };
    return {
      pending: medications.filter((m) => m.status === 'pending').length,
      given: medications.filter((m) => m.status === 'given').length,
      held: medications.filter((m) => m.status === 'held').length,
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medications
          </h3>
          <div className="flex gap-2">
            <Badge variant="secondary">{stats.pending} Pending</Badge>
            <Badge variant="default" className="bg-green-600">{stats.given} Given</Badge>
            {stats.held > 0 && (
              <Badge variant="outline">{stats.held} Held</Badge>
            )}
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Medication Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Quick Add - Common Pre-Op Meds */}
              <div>
                <Label className="text-muted-foreground text-xs uppercase">
                  Quick Add - Common Pre-Op Medications
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {COMMON_PREOP_MEDICATIONS.slice(0, 6).map((med) => (
                    <Button
                      key={med.name}
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-auto py-2"
                      onClick={() => handleAddQuickMed(med)}
                      disabled={createMedication.isPending}
                    >
                      <Syringe className="h-3 w-3 mr-2 flex-shrink-0" />
                      <div className="text-left truncate">
                        <div className="font-medium">{med.name}</div>
                        <div className="text-muted-foreground">{med.dosage}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or add custom
                  </span>
                </div>
              </div>

              {/* Custom Medication Form */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Medication Name *</Label>
                    <MedicineSearchCombobox
                      value={customMed.medication_name}
                      onValueChange={(value) => 
                        setCustomMed({ ...customMed, medication_name: value })
                      }
                      onMedicineSelect={(item) => {
                        otLogger.debug('OTMedicationPanel: Medicine selected from inventory', { 
                          medicineId: item.medicine?.id,
                          medicineName: item.medicine?.name,
                          batchNumber: item.batch_number,
                          quantity: item.quantity 
                        });
                        setCustomMed({ 
                          ...customMed, 
                          medication_name: item.medicine?.name || '',
                          // Auto-enable pharmacy request if low stock
                          requestFromPharmacy: item.quantity < 5
                        });
                      }}
                      placeholder="Search pharmacy inventory..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Dosage</Label>
                    <Input
                      value={customMed.dosage}
                      onChange={(e) =>
                        setCustomMed({ ...customMed, dosage: e.target.value })
                      }
                      placeholder="e.g., 1g"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Route</Label>
                    <Select
                      value={customMed.route}
                      onValueChange={(v) => setCustomMed({ ...customMed, route: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROUTE_OPTIONS.map((route) => (
                          <SelectItem key={route} value={route}>
                            {route}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Timing</Label>
                    <Select
                      value={customMed.timing}
                      onValueChange={(v) =>
                        setCustomMed({ ...customMed, timing: v as MedicationTiming })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TIMING_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea
                    value={customMed.notes}
                    onChange={(e) => setCustomMed({ ...customMed, notes: e.target.value })}
                    placeholder="Special instructions..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">Request from Pharmacy</Label>
                      <p className="text-xs text-muted-foreground">Enable if medication is not in OT cart</p>
                    </div>
                  </div>
                  <Switch
                    checked={customMed.requestFromPharmacy}
                    onCheckedChange={(checked) => setCustomMed({ ...customMed, requestFromPharmacy: checked })}
                  />
                </div>

                <Button
                  onClick={handleAddCustomMed}
                  disabled={!customMed.medication_name.trim() || createMedication.isPending}
                  className="w-full"
                >
                  {customMed.requestFromPharmacy ? 'Add & Request from Pharmacy' : 'Add Medication'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Medication Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MedicationTiming)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pre_op" className="gap-1">
            Pre-Op
            <Badge variant="outline" className="ml-1 text-xs">
              {getMedicationsByTiming('pre_op').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="intra_op" className="gap-1">
            Intra-Op
            <Badge variant="outline" className="ml-1 text-xs">
              {getMedicationsByTiming('intra_op').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="post_op" className="gap-1">
            Post-Op
            <Badge variant="outline" className="ml-1 text-xs">
              {getMedicationsByTiming('post_op').length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {(['pre_op', 'intra_op', 'post_op'] as MedicationTiming[]).map((timing) => (
          <TabsContent key={timing} value={timing} className="mt-4">
            {isLoading ? (
              <p className="text-muted-foreground text-sm p-4">Loading medications...</p>
            ) : getMedicationsByTiming(timing).length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Pill className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No {TIMING_LABELS[timing].toLowerCase()} medications ordered</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {getMedicationsByTiming(timing).map((med) => (
                  <MedicationCard
                    key={med.id}
                    medication={med}
                    surgeryId={surgeryId}
                    onAdminister={() => handleAdminister(med)}
                    onHold={(reason) => {
                      setHoldReason(reason);
                      handleHold(med);
                    }}
                    onCancel={() => handleCancel(med)}
                    onDelete={() => handleDelete(med)}
                    onRequestPharmacy={() => requestPharmacy.mutate({ 
                      medicationId: med.id, 
                      surgeryId 
                    })}
                    holdReason={holdReason}
                    setHoldReason={setHoldReason}
                    isLoading={
                      administerMedication.isPending ||
                      holdMedication.isPending ||
                      cancelMedication.isPending ||
                      deleteMedication.isPending ||
                      requestPharmacy.isPending
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface MedicationCardProps {
  medication: SurgeryMedication;
  surgeryId: string;
  onAdminister: () => void;
  onHold: (reason: string) => void;
  onCancel: () => void;
  onDelete: () => void;
  onRequestPharmacy: () => void;
  holdReason: string;
  setHoldReason: (reason: string) => void;
  isLoading: boolean;
}

function MedicationCard({
  medication,
  surgeryId,
  onAdminister,
  onHold,
  onCancel,
  onDelete,
  onRequestPharmacy,
  holdReason,
  setHoldReason,
  isLoading,
}: MedicationCardProps) {
  const statusConfig = STATUS_CONFIG[medication.status as MedicationStatus];

  return (
    <Card>
      <CardContent className="py-3 px-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{medication.medication_name}</span>
              {medication.dosage && (
                <span className="text-muted-foreground">{medication.dosage}</span>
              )}
              {medication.route && (
                <Badge variant="outline" className="text-xs">
                  {medication.route}
                </Badge>
              )}
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              {medication.pharmacy_status === 'requested' && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Awaiting Pharmacy
                </Badge>
              )}
              {medication.pharmacy_status === 'dispensed' && (
                <Badge variant="default" className="text-xs gap-1">
                  <Package className="h-3 w-3" />
                  Dispensed
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
              {medication.ordered_by_profile?.full_name && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Ordered by {medication.ordered_by_profile.full_name}
                </span>
              )}
              {medication.administered_at && (
                <span className="flex items-center gap-1 text-green-600">
                  <Check className="h-3 w-3" />
                  Given at {format(new Date(medication.administered_at), 'HH:mm')}
                  {medication.administered_by_profile?.full_name &&
                    ` by ${medication.administered_by_profile.full_name}`}
                </span>
              )}
              {medication.hold_reason && (
                <span className="flex items-center gap-1 text-orange-600">
                  <Pause className="h-3 w-3" />
                  Held: {medication.hold_reason}
                </span>
              )}
            </div>

            {medication.notes && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                {medication.notes}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {medication.status === 'pending' && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Request from Pharmacy button - shown when not yet requested */}
              {medication.pharmacy_status === 'not_required' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={onRequestPharmacy}
                  disabled={isLoading}
                >
                  <Package className="h-3 w-3" />
                  Request
                </Button>
              )}
              
              <Button
                size="sm"
                variant="default"
                className="gap-1 bg-green-600 hover:bg-green-700"
                onClick={onAdminister}
                disabled={isLoading}
              >
                <Check className="h-3 w-3" />
                Give
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" disabled={isLoading}>
                    <Pause className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hold Medication</AlertDialogTitle>
                    <AlertDialogDescription>
                      Why is this medication being held?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Textarea
                    value={holdReason}
                    onChange={(e) => setHoldReason(e.target.value)}
                    placeholder="Enter reason for holding..."
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setHoldReason('')}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onHold(holdReason)}
                      disabled={!holdReason.trim()}
                    >
                      Hold Medication
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-destructive" disabled={isLoading}>
                    <X className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Medication</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will cancel the medication order. Are you sure?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, keep it</AlertDialogCancel>
                    <AlertDialogAction onClick={onCancel}>
                      Yes, cancel order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {(medication.status === 'cancelled' || medication.status === 'held') && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-destructive" disabled={isLoading}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Medication</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove this medication order from the record.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

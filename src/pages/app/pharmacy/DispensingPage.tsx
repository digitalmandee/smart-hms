import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, differenceInYears } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BatchSelector } from "@/components/pharmacy/BatchSelector";
import { StockLevelBadge } from "@/components/pharmacy/StockLevelBadge";
import { WasfatySubmitButton } from "@/components/pharmacy/WasfatySubmitButton";
import { usePrescriptionForDispensing, useDispensePrescription, useMedicineBatches, useInventory } from "@/hooks/usePharmacy";
import { usePatientActiveAdmission } from "@/hooks/useIPDBilling";
import { useAuth } from "@/contexts/AuthContext";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { ArrowLeft, User, Stethoscope, Pill, AlertTriangle, Bed, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { CartItem } from "@/hooks/usePOS";

interface DispensingItem {
  itemId: string;
  medicineName: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  quantity: number | null;
  instructions: string | null;
  medicineId: string | null;
  isDispensed: boolean;
  selectedBatchId?: string;
  quantityToDispense: number;
  selected: boolean;
}

function DispensingItemRow({ 
  item, 
  onToggle, 
  onBatchSelect 
}: { 
  item: DispensingItem; 
  onToggle: () => void;
  onBatchSelect: (batchId: string) => void;
}) {
  const { data: batches, isLoading } = useMedicineBatches(item.medicineId || undefined);

  const totalAvailable = batches?.reduce((sum, b) => sum + (b.quantity || 0), 0) || 0;

  return (
    <div className={`p-4 border rounded-lg ${item.isDispensed ? "bg-muted/50" : ""}`}>
      <div className="flex items-start gap-4">
        <Checkbox
          checked={item.selected}
          onCheckedChange={onToggle}
          disabled={item.isDispensed}
        />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{item.medicineName}</p>
              <p className="text-sm text-muted-foreground">
                {item.dosage} | {item.frequency} | {item.duration}
              </p>
              {item.instructions && (
                <p className="text-xs text-muted-foreground mt-1">{item.instructions}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Qty: {item.quantity || "-"}</p>
              {item.isDispensed ? (
                <Badge variant="secondary">Dispensed</Badge>
              ) : (
                <StockLevelBadge quantity={totalAvailable} />
              )}
            </div>
          </div>

          {!item.isDispensed && item.medicineId && (
            <div className="pt-2">
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <BatchSelector
                  batches={batches || []}
                  selectedBatchId={item.selectedBatchId}
                  onSelect={onBatchSelect}
                  disabled={!item.selected}
                />
              )}
            </div>
          )}

          {!item.isDispensed && !item.medicineId && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This item is not linked to inventory. Will be marked as dispensed without stock deduction.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DispensingPage() {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { country_code } = useCountryConfig();
  const { data: prescription, isLoading } = usePrescriptionForDispensing(prescriptionId);
  const dispenseMutation = useDispensePrescription();
  const { data: inventory } = useInventory();
  const patientId = (prescription?.patient as any)?.id;
  const { data: activeAdmission } = usePatientActiveAdmission(patientId);
  const [items, setItems] = useState<DispensingItem[]>([]);
  const [notes, setNotes] = useState("");
  
  const showWasfaty = country_code === 'SA';

  useEffect(() => {
    if (prescription?.items) {
      setItems(
        prescription.items.map((item) => ({
          itemId: item.id,
          medicineName: item.medicine_name,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          quantity: item.quantity,
          instructions: item.instructions,
          medicineId: item.medicine_id,
          isDispensed: item.is_dispensed || false,
          selectedBatchId: undefined,
          quantityToDispense: item.quantity || 0,
          selected: !item.is_dispensed,
        }))
      );
    }
  }, [prescription]);

  const handleToggleItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleBatchSelect = (index: number, batchId: string) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, selectedBatchId: batchId } : item
      )
    );
  };

  // Get batch details from inventory for building cart
  const getBatchDetails = (batchId: string) => {
    return inventory?.find(inv => inv.id === batchId);
  };

  // Check for stock issues in selected items
  const stockIssues = useMemo(() => {
    return items.filter(item => {
      if (!item.selected || item.isDispensed) return false;
      if (!item.selectedBatchId) return true; // No batch selected
      const batch = getBatchDetails(item.selectedBatchId);
      return !batch || (batch.quantity || 0) < item.quantityToDispense;
    });
  }, [items, inventory]);

  const hasStockIssues = stockIssues.length > 0;

  // Handle sending to POS (for OPD patients) or direct dispense (for IPD patients)
  const handleSendToPOS = () => {
    const selectedItems = items.filter(item => item.selected && !item.isDispensed && item.selectedBatchId);
    
    if (selectedItems.length === 0) {
      toast.error("Please select items and batches to dispense");
      return;
    }

    // Build cart items for POS
    const cartItems: CartItem[] = selectedItems.map(item => {
      const batch = getBatchDetails(item.selectedBatchId!);
      return {
        id: `rx-${item.itemId}`,
        inventory_id: item.selectedBatchId || null,
        medicine_id: item.medicineId || null,
        medicine_name: item.medicineName,
        batch_number: batch?.batch_number || null,
        quantity: item.quantityToDispense,
        unit_price: batch?.selling_price || 0,
        selling_price: batch?.selling_price || 0,
        available_quantity: batch?.quantity || 0,
        discount_percent: 0,
        tax_percent: 0,
        prescription_id: prescriptionId,
        prescription_item_id: item.itemId,
      };
    });

    const patient = prescription?.patient as any;
    
    // Navigate to POS with prescription context
    navigate("/app/pharmacy/pos", {
      state: {
        prescriptionCart: cartItems,
        patient: patient ? {
          id: patient.id,
          patient_number: patient.patient_number,
          first_name: patient.first_name,
          last_name: patient.last_name,
          phone: patient.phone,
          date_of_birth: patient.date_of_birth,
          gender: patient.gender,
        } : null,
        prescriptionNumber: prescription?.prescription_number,
      },
    });
  };

  // Handle direct dispense for IPD patients (charges added to IPD account)
  const handleIPDDispense = async () => {
    const itemsToDispense = items
      .filter((item) => item.selected && !item.isDispensed)
      .map((item) => ({
        itemId: item.itemId,
        inventoryId: item.selectedBatchId,
        quantityDispensed: item.quantityToDispense,
      }));

    if (itemsToDispense.length === 0) return;

    dispenseMutation.mutate(
      {
        prescriptionId: prescriptionId!,
        dispensedItems: itemsToDispense,
        notes,
      },
      {
        onSuccess: () => {
          toast.success("Dispensed to IPD Patient", {
            description: "Medication charges added to patient's IPD account",
          });
          navigate("/app/pharmacy/queue");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Prescription not found</p>
        <Button variant="link" onClick={() => navigate("/app/pharmacy/queue")}>
          Back to Queue
        </Button>
      </div>
    );
  }

  const patient = prescription.patient as any;
  const doctor = prescription.doctor as any;
  const patientAge = patient?.date_of_birth
    ? differenceInYears(new Date(), new Date(patient.date_of_birth))
    : null;

  const selectedCount = items.filter((i) => i.selected && !i.isDispensed).length;
  const allDispensed = items.every((i) => i.isDispensed);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Dispense ${prescription.prescription_number}`}
        description={format(new Date(prescription.created_at), "MMMM d, yyyy 'at' h:mm a")}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/pharmacy/queue")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Queue
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prescription Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Prescription Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <DispensingItemRow
                  key={item.itemId}
                  item={item}
                  onToggle={() => handleToggleItem(index)}
                  onBatchSelect={(batchId) => handleBatchSelect(index, batchId)}
                />
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Dispensing Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any notes about this dispensing..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-lg">
                    {patient?.first_name} {patient?.last_name}
                  </p>
                  {activeAdmission && (
                    <Badge variant="secondary" className="bg-info/20 text-info">
                      <Bed className="h-3 w-3 mr-1" />
                      IPD
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{patient?.patient_number}</p>
              </div>
              
              {activeAdmission && (
                <>
                  <Separator />
                  <div className="p-2 bg-info/10 rounded-lg text-sm">
                    <p className="font-medium text-info">Admitted Patient</p>
                    <p className="text-muted-foreground">
                      {(activeAdmission.ward as any)?.name} - Bed {(activeAdmission.bed as any)?.bed_number}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Charges will be added to IPD account
                    </p>
                  </div>
                </>
              )}
              
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <Label className="text-muted-foreground">Age</Label>
                  <p>{patientAge ? `${patientAge} years` : "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Gender</Label>
                  <p className="capitalize">{patient?.gender || "-"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Phone</Label>
                  <p>{patient?.phone || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Prescribing Doctor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{doctor?.profile?.full_name}</p>
              <p className="text-sm text-muted-foreground">{doctor?.specialization}</p>
            </CardContent>
          </Card>

          {/* Stock Issues Warning */}
          {hasStockIssues && !allDispensed && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {stockIssues.length} item(s) have insufficient stock or missing batch selection.
              </AlertDescription>
            </Alert>
          )}

          {/* Action */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              {allDispensed ? (
                <div className="text-center space-y-3">
                  <Badge variant="secondary" className="text-lg py-2 px-4">
                    Fully Dispensed
                  </Badge>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/app/pharmacy/queue")}
                  >
                    Back to Queue
                  </Button>
                </div>
              ) : activeAdmission ? (
                // IPD Patient - Direct dispense (charges added to IPD account)
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleIPDDispense}
                  disabled={selectedCount === 0 || hasStockIssues || dispenseMutation.isPending}
                >
                  {dispenseMutation.isPending
                    ? "Processing..."
                    : `Dispense to IPD (${selectedCount} Items)`}
                </Button>
              ) : (
                // OPD Patient - Send to POS for payment
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSendToPOS}
                  disabled={selectedCount === 0 || hasStockIssues}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Send to POS ({selectedCount} Items)
                </Button>
              )}
              
              {!allDispensed && !activeAdmission && (
                <p className="text-xs text-muted-foreground text-center">
                  Items will be sent to POS for payment processing
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

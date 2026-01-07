import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { BatchSelector } from "@/components/pharmacy/BatchSelector";
import { StockLevelBadge } from "@/components/pharmacy/StockLevelBadge";
import { usePrescriptionForDispensing, useDispensePrescription, useMedicineBatches } from "@/hooks/usePharmacy";
import { useCreateInvoice } from "@/hooks/useBilling";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, User, Calendar, Stethoscope, Pill, AlertTriangle, FileText, Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

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
  const { data: prescription, isLoading } = usePrescriptionForDispensing(prescriptionId);
  const dispenseMutation = useDispensePrescription();
  const createInvoiceMutation = useCreateInvoice();
  const [items, setItems] = useState<DispensingItem[]>([]);
  const [notes, setNotes] = useState("");
  const [generateInvoice, setGenerateInvoice] = useState(true);

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

  const handleDispense = async () => {
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
        onSuccess: async () => {
          // Generate invoice if option is checked
          if (generateInvoice && prescription && profile?.branch_id) {
            try {
              // Get dispensed items with prices from batches
              const invoiceItems = items
                .filter((item) => item.selected && !item.isDispensed && item.selectedBatchId)
                .map((item) => ({
                  description: item.medicineName,
                  quantity: item.quantityToDispense,
                  unit_price: 0, // Will be set from batch data below
                  discount_percent: 0,
                  medicine_inventory_id: item.selectedBatchId,
                }));

              if (invoiceItems.length > 0) {
                const patient = prescription.patient as any;
                const invoice = await createInvoiceMutation.mutateAsync({
                  patientId: patient.id,
                  branchId: profile.branch_id,
                  items: invoiceItems,
                  notes: `Invoice for prescription ${prescription.prescription_number}`,
                  taxAmount: 0,
                  discountAmount: 0,
                  status: "pending",
                });
                
                toast.success("Invoice generated", {
                  description: `Invoice created for dispensed medicines`,
                  action: {
                    label: "View Invoice",
                    onClick: () => navigate(`/app/billing/invoices/${invoice.id}`),
                  },
                });
              }
            } catch (error) {
              console.error("Failed to create invoice:", error);
              toast.error("Failed to generate invoice");
            }
          }
          
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
                <p className="font-semibold text-lg">
                  {patient?.first_name} {patient?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{patient?.patient_number}</p>
              </div>
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

          {/* Invoice Option */}
          {!allDispensed && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Billing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="generate-invoice">Generate Invoice</Label>
                    <p className="text-sm text-muted-foreground">
                      Create invoice after dispensing
                    </p>
                  </div>
                  <Switch
                    id="generate-invoice"
                    checked={generateInvoice}
                    onCheckedChange={setGenerateInvoice}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action */}
          <Card>
            <CardContent className="pt-6">
              {allDispensed ? (
                <div className="text-center space-y-3">
                  <Badge variant="secondary" className="text-lg py-2 px-4">
                    Fully Dispensed
                  </Badge>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/app/billing/invoices/new?patientId=${(prescription.patient as any)?.id}`)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleDispense}
                  disabled={selectedCount === 0 || dispenseMutation.isPending || createInvoiceMutation.isPending}
                >
                  {dispenseMutation.isPending || createInvoiceMutation.isPending
                    ? "Processing..."
                    : `Dispense ${selectedCount} Item(s)`}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

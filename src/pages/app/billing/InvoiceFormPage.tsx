import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PatientSearch } from "@/components/appointments/PatientSearch";
import { InvoiceItemsBuilder } from "@/components/billing/InvoiceItemsBuilder";
import { InvoiceTotals } from "@/components/billing/InvoiceTotals";
import { PatientBalanceCard } from "@/components/billing/PatientBalanceCard";
import { useCreateInvoice, useInvoice, useUpdateInvoice, InvoiceItemInput } from "@/hooks/useBilling";

import { useSurgery, useUpdateSurgeryInvoice } from "@/hooks/useOT";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Save, FileText, Scissors } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Patient {
  id: string;
  first_name: string;
  last_name: string | null;
  patient_number: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
}

export default function InvoiceFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();

  const isEdit = !!id;
  const surgeryId = searchParams.get("surgeryId");


  const { data: existingInvoice, isLoading } = useInvoice(id);
  const { data: surgery, isLoading: surgeryLoading } = useSurgery(surgeryId || "");
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();
  const updateSurgeryInvoiceMutation = useUpdateSurgeryInvoice();

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [items, setItems] = useState<InvoiceItemInput[]>([]);
  const [notes, setNotes] = useState("");
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [surgeryInitialized, setSurgeryInitialized] = useState(false);

  // Initialize from existing invoice (edit mode)
  useEffect(() => {
    if (existingInvoice && isEdit) {
      setSelectedPatient({
        id: existingInvoice.patient.id,
        first_name: existingInvoice.patient.first_name,
        last_name: existingInvoice.patient.last_name,
        patient_number: existingInvoice.patient.patient_number,
        phone: existingInvoice.patient.phone || null,
        date_of_birth: null,
        gender: null,
      });
      setNotes(existingInvoice.notes || "");
      setTaxAmount(Number(existingInvoice.tax_amount) || 0);
      setDiscountAmount(Number(existingInvoice.discount_amount) || 0);
      setItems(
        existingInvoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity || 1,
          unit_price: Number(item.unit_price) || 0,
          discount_percent: Number(item.discount_percent) || 0,
          service_type_id: item.service_type_id,
          medicine_inventory_id: item.medicine_inventory_id,
        }))
      );
    }
  }, [existingInvoice, isEdit]);

  // Initialize from surgery context (new invoice for surgery)
  useEffect(() => {
    if (surgery && surgeryId && !isEdit && !surgeryInitialized) {
      // Set patient from surgery
      if (surgery.patient) {
        setSelectedPatient({
          id: surgery.patient.id,
          first_name: surgery.patient.first_name,
          last_name: surgery.patient.last_name || null,
          patient_number: surgery.patient.patient_number,
          phone: surgery.patient.phone || null,
          date_of_birth: surgery.patient.date_of_birth || null,
          gender: surgery.patient.gender || null,
        });
      }

      // Add surgery procedure as initial item
      const procedureItem: InvoiceItemInput = {
        description: `Surgery: ${surgery.procedure_name}`,
        quantity: 1,
        unit_price: surgery.estimated_cost || 0,
        discount_percent: 0,
        category: "procedure",
      };
      setItems([procedureItem]);

      // Set notes with surgery reference
      setNotes(`Surgery: ${surgery.surgery_number} - ${surgery.procedure_name}`);

      setSurgeryInitialized(true);
    }
  }, [surgery, surgeryId, isEdit, surgeryInitialized]);

  const subtotal = items.reduce((sum, item) => {
    return sum + item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);
  }, 0);

  const handleSubmit = async (status: "draft" | "pending" = "pending") => {
    if (!selectedPatient || items.length === 0) return;

    const branchId = profile?.branch_id;
    if (!branchId) return;

    if (isEdit && id) {
      await updateMutation.mutateAsync({
        id,
        items,
        notes,
        taxAmount,
        discountAmount,
        status,
      });
      navigate(`/app/billing/invoices/${id}`);
    } else {
      const invoice = await createMutation.mutateAsync({
        patientId: selectedPatient.id,
        branchId,
        items,
        notes,
        taxAmount,
        discountAmount,
        status,
      });

      // Link invoice to surgery if this was created from surgery context
      if (surgeryId && invoice.id) {
        await updateSurgeryInvoiceMutation.mutateAsync({
          surgeryId,
          invoiceId: invoice.id,
        });
      }

      navigate(`/app/billing/invoices/${invoice.id}`);
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (surgeryId && surgeryLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Invoice" : surgeryId ? "Surgery Invoice" : "Create Invoice"}
        description={
          isEdit 
            ? `Editing ${existingInvoice?.invoice_number}` 
            : surgeryId && surgery 
              ? `Creating invoice for surgery ${surgery.surgery_number}`
              : "Create a new patient invoice"
        }
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Session Warning Banner (soft enforcement) */}
      {!sessionLoading && !hasActiveSession && (
        <Alert variant="destructive" className="border-warning bg-warning/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Active Billing Session</AlertTitle>
          <AlertDescription>
            You can create this invoice, but you won't be able to collect payment until you open a billing session from the Billing Dashboard.
          </AlertDescription>
        </Alert>
      )}

      {/* Surgery Context Banner */}
      {surgeryId && surgery && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Scissors className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium">
                  Surgery: {surgery.surgery_number}
                </p>
                <p className="text-sm text-muted-foreground">
                  {surgery.procedure_name} • {surgery.patient?.first_name} {surgery.patient?.last_name}
                </p>
              </div>
              <Badge variant="secondary">{surgery.priority}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Patient</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientSearch
                onSelect={(patient) => setSelectedPatient(patient)}
                selectedPatient={selectedPatient}
              />
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceItemsBuilder
                items={items}
                onChange={setItems}
                disabled={false}
              />
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any notes for this invoice..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <PatientBalanceCard patientId={selectedPatient?.id || ""} />

          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceTotals
                subtotal={subtotal}
                taxAmount={taxAmount}
                discountAmount={discountAmount}
                editable
                onTaxChange={setTaxAmount}
                onDiscountChange={setDiscountAmount}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleSubmit("pending")}
                disabled={
                  !selectedPatient ||
                  items.length === 0 ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              >
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : isEdit
                  ? "Update Invoice"
                  : "Create Invoice"}
              </Button>
              {!isEdit && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSubmit("draft")}
                  disabled={!selectedPatient || items.length === 0 || createMutation.isPending}
                >
                  Save as Draft
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

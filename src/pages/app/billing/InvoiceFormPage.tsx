import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PatientSearch } from "@/components/appointments/PatientSearch";
import { InvoiceItemsBuilder } from "@/components/billing/InvoiceItemsBuilder";
import { InvoiceTotals } from "@/components/billing/InvoiceTotals";
import { PatientBalanceCard } from "@/components/billing/PatientBalanceCard";
import { useCreateInvoice, useInvoice, useUpdateInvoice, InvoiceItemInput } from "@/hooks/useBilling";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Save, FileText } from "lucide-react";
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
  const preselectedPatientId = searchParams.get("patientId");

  const { data: existingInvoice, isLoading } = useInvoice(id);
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [items, setItems] = useState<InvoiceItemInput[]>([]);
  const [notes, setNotes] = useState("");
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Note: preselectedPatientId would need a fetch to get patient object
  // For now, we handle it in the PatientSearch component

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Invoice" : "Create Invoice"}
        description={isEdit ? `Editing ${existingInvoice?.invoice_number}` : "Create a new patient invoice"}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

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

import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInvoice, useCancelInvoice, useGenerateZatcaQR } from "@/hooks/useBilling";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useAuth } from "@/contexts/AuthContext";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { InvoiceStatusBadge } from "@/components/billing/InvoiceStatusBadge";
import { InvoiceTotals } from "@/components/billing/InvoiceTotals";
import { PrintableInvoice } from "@/components/billing/PrintableInvoice";
import { ZatcaQRDisplay } from "@/components/billing/ZatcaQRDisplay";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  ArrowLeft,
  Printer,
  CreditCard,
  Edit,
  XCircle,
  User,
  DollarSign,
  BookOpen,
  ExternalLink,
  FlaskConical,
  Loader2,
  Wallet,
} from "lucide-react";
import { useDepositBalance, useCreatePatientDeposit } from "@/hooks/usePatientDeposits";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useRecordPayment } from "@/hooks/useBilling";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrint } from "@/hooks/usePrint";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateLabOrderFromInvoice } from "@/hooks/useCreateLabOrderFromInvoice";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { country_code, e_invoicing_enabled } = useCountryConfig();
  const { printRef, handlePrint } = usePrint();

  const { data: invoice, isLoading } = useInvoice(id);
  const { data: organizations } = useOrganizations();
  const cancelMutation = useCancelInvoice();
  const createLabOrderMutation = useCreateLabOrderFromInvoice();
  const generateZatcaMutation = useGenerateZatcaQR();
  const { formatCurrency } = useCurrencyFormatter();

  // Deposit balance for the patient
  const { data: depositData } = useDepositBalance(invoice?.patient?.id);
  const createDeposit = useCreatePatientDeposit();
  const recordPayment = useRecordPayment();

  const showZatca = country_code === 'SA' && e_invoicing_enabled;

  // Query for linked journal entry
  const { data: journalEntry } = useQuery({
    queryKey: ["journal-entry-for-invoice", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id, entry_number, entry_date, is_posted")
        .eq("reference_type", "invoice")
        .eq("reference_id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Query deposit applications linked to this invoice
  const { data: depositApplications } = useQuery({
    queryKey: ["deposit-applications-for-invoice", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_deposits")
        .select("amount")
        .eq("invoice_id", id!)
        .eq("type", "applied")
        .eq("status", "completed");
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const depositAppliedAmount = (depositApplications || []).reduce(
    (sum, d) => sum + Number(d.amount), 0
  );

  // Query for linked lab order
  const { data: linkedLabOrder } = useQuery({
    queryKey: ["lab-order-for-invoice", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_orders")
        .select("id, order_number, status")
        .eq("invoice_id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Query to check if invoice has lab items
  const { data: labItemsInfo } = useQuery({
    queryKey: ["invoice-lab-items", id],
    queryFn: async () => {
      if (!invoice) return { hasLabItems: false, labItems: [] };
      
      const serviceTypeIds = invoice.items
        .filter((i) => i.service_type_id)
        .map((i) => i.service_type_id!);

      if (serviceTypeIds.length === 0) return { hasLabItems: false, labItems: [] };

      const { data: serviceTypes } = await supabase
        .from("service_types")
        .select("id, category, name")
        .in("id", serviceTypeIds);

      const labServiceIds =
        serviceTypes?.filter((st) => st.category === "lab").map((st) => st.id) || [];

      const labItems = invoice.items.filter(
        (item) => item.service_type_id && labServiceIds.includes(item.service_type_id)
      );

      return { hasLabItems: labItems.length > 0, labItems };
    },
    enabled: !!invoice,
  });

  const organization = organizations?.find(
    (o) => o.id === profile?.organization_id
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Invoice not found</p>
        <Button variant="link" onClick={() => navigate("/app/billing/invoices")}>
          Back to Invoices
        </Button>
      </div>
    );
  }

  const invoiceBalance = (invoice.total_amount || 0) - (invoice.paid_amount || 0);
  const canEdit = invoice.status === "draft";
  const canPay = ["pending", "partially_paid"].includes(invoice.status || "");
  const canCancel = ["draft", "pending"].includes(invoice.status || "");
  const availableDeposit = depositData?.balance || 0;
  const canApplyDeposit = canPay && availableDeposit > 0 && invoiceBalance > 0;

  const handleApplyDeposit = async () => {
    if (!canApplyDeposit || !id || !invoice.patient?.id) return;
    const applyAmount = Math.min(availableDeposit, invoiceBalance);
    
    // Create "applied" deposit record — triggers GL: DR LIA-DEP-001, CR AR-001
    await createDeposit.mutateAsync({
      patient_id: invoice.patient.id,
      amount: applyAmount,
      type: "applied",
      invoice_id: id,
      notes: `Applied to ${invoice.invoice_number}`,
    });

    // Directly update invoice paid_amount and status (no payment record needed —
    // no cash was received, the deposit trigger handles the correct GL entry)
    const newPaid = (invoice.paid_amount || 0) + applyAmount;
    const newStatus = newPaid >= (invoice.total_amount || 0) ? "paid" : "partially_paid";
    await supabase
      .from("invoices")
      .update({ paid_amount: newPaid, status: newStatus })
      .eq("id", id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={invoice.invoice_number}
        description={format(
          new Date(invoice.invoice_date || invoice.created_at),
          "MMMM d, yyyy"
        )}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/app/billing/invoices")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" onClick={() => handlePrint({ title: invoice.invoice_number })}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            {canEdit && (
              <Button
                variant="outline"
                onClick={() => navigate(`/app/billing/invoices/${id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {canPay && (
              <Button onClick={() => navigate(`/app/billing/invoices/${id}/pay`)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invoice Details</CardTitle>
              <InvoiceStatusBadge status={invoice.status} />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Disc</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        Rs. {Number(item.unit_price).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.discount_percent || 0}%
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Rs. {Number(item.total_price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.payments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No payments recorded
                </p>
              ) : (
                <div className="space-y-3">
                  {invoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">
                          Rs. {Number(payment.amount).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.payment_method?.name || "Cash"} •{" "}
                          {format(
                            new Date(payment.payment_date || payment.created_at),
                            "MMM dd, yyyy hh:mm a"
                          )}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        by {payment.received_by_profile?.full_name || "Unknown"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
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
            <CardContent>
              <p className="font-semibold text-lg">
                {invoice.patient.first_name} {invoice.patient.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {invoice.patient.patient_number}
              </p>
              {invoice.patient.phone && (
                <p className="text-sm mt-2">{invoice.patient.phone}</p>
              )}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceTotals
                subtotal={Number(invoice.subtotal) || 0}
                taxAmount={Number(invoice.tax_amount) || 0}
                discountAmount={Number(invoice.discount_amount) || 0}
                paidAmount={Number(invoice.paid_amount) || 0}
                depositApplied={depositAppliedAmount}
              />
            </CardContent>
          </Card>

          {/* Patient Deposit Balance */}
          {(availableDeposit > 0 || (depositData && depositData.deposits > 0)) && (
            <Card className="border-emerald-500/50 bg-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-emerald-600">
                  <Wallet className="h-4 w-4" />
                  Patient Deposit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Deposits</span>
                  <span>{formatCurrency(depositData?.deposits || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Applied</span>
                  <span>{formatCurrency((depositData?.applied || 0) + (depositData?.refunds || 0))}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Available Balance</span>
                  <span className="text-emerald-600">{formatCurrency(availableDeposit)}</span>
                </div>
                {canApplyDeposit && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleApplyDeposit}
                    disabled={createDeposit.isPending || recordPayment.isPending}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    {createDeposit.isPending || recordPayment.isPending
                      ? "Applying..."
                      : `Apply ${formatCurrency(Math.min(availableDeposit, invoiceBalance))} from Deposit`}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {labItemsInfo?.hasLabItems && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Lab Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                {linkedLabOrder ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Order #</span>
                      <span className="font-medium">{linkedLabOrder.order_number}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant="secondary">{linkedLabOrder.status}</Badge>
                    </div>
                    <Separator />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/app/lab/orders/${linkedLabOrder.id}`)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Lab Order
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                      This invoice has {labItemsInfo.labItems.length} lab test(s) but no lab order created.
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => {
                        if (invoice && id) {
                          createLabOrderMutation.mutate({
                            invoiceId: id,
                            invoiceNumber: invoice.invoice_number,
                            patientId: invoice.patient.id,
                            branchId: invoice.branch_id,
                            items: invoice.items.map((item) => ({
                              id: item.id,
                              description: item.description,
                              service_type_id: item.service_type_id || null,
                              quantity: item.quantity,
                              unit_price: Number(item.unit_price),
                            })),
                          });
                        }
                      }}
                      disabled={createLabOrderMutation.isPending}
                    >
                      {createLabOrderMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <FlaskConical className="mr-2 h-4 w-4" />
                          Create Lab Order
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Accounting Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Accounting
              </CardTitle>
            </CardHeader>
            <CardContent>
              {journalEntry ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={journalEntry.is_posted ? "default" : "secondary"}>
                      {journalEntry.is_posted ? "Posted" : "Draft"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Entry #</span>
                    <span className="font-medium">{journalEntry.entry_number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span>{format(new Date(journalEntry.entry_date), "MMM dd, yyyy")}</span>
                  </div>
                  <Separator />
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/app/accounts/journal-entries")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View in Accounts
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  {invoice.status === 'draft' 
                    ? "Journal entry will be created when invoice is finalized"
                    : "No journal entry linked"}
                </p>
              )}
            </CardContent>
          </Card>

          {/* ZATCA E-Invoice (KSA Only) */}
          {showZatca && (
            <ZatcaQRDisplay
              zatcaQrCode={(invoice as any).zatca_qr_code}
              zatcaUuid={(invoice as any).zatca_uuid}
              zatcaIcv={(invoice as any).zatca_icv}
              zatcaClearanceStatus={(invoice as any).zatca_clearance_status}
              zatcaInvoiceHash={(invoice as any).zatca_invoice_hash}
              isGenerating={generateZatcaMutation.isPending}
              onGenerate={() => generateZatcaMutation.mutate({ invoiceId: invoice.id })}
            />
          )}

          {/* Actions */}
          {canCancel && (
            <Card>
              <CardContent className="pt-6">
                <ConfirmDialog
                  title="Cancel Invoice"
                  description="Are you sure you want to cancel this invoice? This action cannot be undone."
                  variant="destructive"
                  confirmLabel="Cancel Invoice"
                  onConfirm={() => {
                    cancelMutation.mutate(invoice.id, {
                      onSuccess: () => navigate("/app/billing/invoices"),
                    });
                  }}
                  trigger={
                    <Button variant="destructive" className="w-full">
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Invoice
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Hidden Printable Invoice */}
      <div className="hidden">
        <PrintableInvoice
          ref={printRef}
          invoice={invoice}
          organization={organization ? {
            name: organization.name,
            address: organization.address,
            phone: organization.phone,
            email: organization.email,
            logo_url: organization.logo_url,
            slug: organization.slug,
          } : undefined}
        />
      </div>
    </div>
  );
}

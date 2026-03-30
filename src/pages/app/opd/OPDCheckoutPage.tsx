// OPD Checkout Page - handles billing and payment processing for OPD visits
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Receipt, 
  CreditCard, 
  Pill, 
  TestTubes, 
  Stethoscope,
  Scan,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";
import { generateVisitId } from "@/lib/visit-id";
import { useCreateInvoice, useRecordPayment } from "@/hooks/useBilling";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireSession } from "@/hooks/useRequireSession";
import { PaymentMethodSelector } from "@/components/billing/PaymentMethodSelector";
import { SessionRequiredGuard } from "@/components/billing/SessionRequiredGuard";
import { SessionStatusBanner } from "@/components/billing/SessionStatusBanner";
import { InsuranceBillingSplit, BillingSplit } from "@/components/insurance/InsuranceBillingSplit";
import { InsuranceClaimPrompt } from "@/components/insurance/InsuranceClaimPrompt";
import { toast } from "sonner";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

interface ChargeItem {
  id: string;
  type: "consultation" | "lab" | "prescription" | "imaging" | "blood";
  description: string;
  amount: number;
  status: "pending" | "invoiced" | "paid";
  referenceId?: string;
  doctorId?: string;
  serviceTypeId?: string;
}

export default function OPDCheckoutPage() {
  const { appointmentId: routeAppointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const appointmentId = routeAppointmentId || searchParams.get("appointmentId");
  const navigate = useNavigate();



  const { profile } = useAuth();
  const { formatCurrency } = useCurrencyFormatter();
  const [selectedCharges, setSelectedCharges] = useState<string[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingSplit, setBillingSplit] = useState<BillingSplit | null>(null);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  
  // Session requirement for payment collection
  const { hasActiveSession, session, isLoading: sessionLoading } = useRequireSession("reception");
  
  const createInvoice = useCreateInvoice();
  const recordPayment = useRecordPayment();
  const queryClient = useQueryClient();


  // Fetch consultation service type for commission tracking
  const { data: consultationServiceType } = useQuery({
    queryKey: ["consultation-service-type", profile?.organization_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_types")
        .select("id")
        .eq("category", "consultation")
        .eq("organization_id", profile!.organization_id!)
        .limit(1)
        .single();
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch lab service types for fallback price resolution (legacy items without service_type_id)
  const { data: labServiceTypes } = useQuery({
    queryKey: ["lab-service-types-fallback", profile?.organization_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_types")
        .select("id, name, default_price")
        .eq("category", "lab")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true);
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch radiology service types for imaging price resolution (fuzzy name match)
  const { data: radiologyServiceTypes } = useQuery({
    queryKey: ["radiology-service-types-fallback", profile?.organization_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_types")
        .select("id, name, default_price")
        .eq("category", "radiology")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true);
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch appointment with related data
  const { data: appointment, isLoading: appointmentLoading } = useQuery({
    queryKey: ["opd-checkout-appointment", appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number),
          doctor:doctors(id, profiles(full_name), consultation_fee),
          branch:branches(id, name)
        `)
        .eq("id", appointmentId!)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!appointmentId,
  });


  const { data: consultation } = useQuery({
    queryKey: ["opd-checkout-consultation", appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultations")
        .select("*")
        .eq("appointment_id", appointmentId!)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!appointmentId,
  });

  // Fetch lab orders for this consultation
  const { data: labOrders } = useQuery({
    queryKey: ["opd-checkout-lab-orders", consultation?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_orders")
        .select(`
          *,
          items:lab_order_items(*, service_type:service_types(name, default_price))
        `)
        .eq("consultation_id", consultation!.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!consultation?.id,
  });

  // Fetch imaging orders for this consultation — also pick up unlinked orders for the same patient today
  const { data: imagingOrders } = useQuery({
    queryKey: ["opd-checkout-imaging-orders", consultation?.id, appointment?.patient?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const patientId = appointment?.patient?.id;
      
      let query = supabase
        .from("imaging_orders")
        .select("*, imaging_procedure:imaging_procedures(base_price, service_type_id, service_types(id, default_price))");
      
      if (consultation?.id && patientId) {
        query = query.or(
          `consultation_id.eq.${consultation.id},and(patient_id.eq.${patientId},consultation_id.is.null,invoice_id.is.null,created_at.gte.${today})`
        );
      } else if (consultation?.id) {
        query = query.eq("consultation_id", consultation.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!(consultation?.id || appointment?.patient?.id),
  });

  // Fetch prescriptions for this consultation
  const { data: prescriptions } = useQuery({
    queryKey: ["opd-checkout-prescriptions", consultation?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          items:prescription_items(*)
        `)
        .eq("consultation_id", consultation!.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!consultation?.id,
  });

  // Auto-redirect if appointment is fully paid AND no unpaid lab/imaging orders
  useEffect(() => {
    if (appointment && appointment.payment_status === "paid" && labOrders !== undefined && imagingOrders !== undefined) {
      const hasUnpaidLab = labOrders?.some(o => !o.invoice_id) || false;
      const hasUnpaidImaging = imagingOrders?.some((o: any) => !o.invoice_id) || false;
      
      if (!hasUnpaidLab && !hasUnpaidImaging) {
        toast.info("This appointment has already been checked out");
        if (appointment.invoice_id) {
          navigate(`/app/billing/invoices/${appointment.invoice_id}`, { replace: true });
        } else {
          navigate("/app/opd/pending-checkout", { replace: true });
        }
      }
    }
  }, [appointment, labOrders, imagingOrders, navigate]);

  // Redirect to pending checkout if no appointmentId
  if (!appointmentId) {
    return <Navigate to="/app/opd/pending-checkout" replace />;
  }

  // Build charge items
  const charges: ChargeItem[] = [];

  // Consultation fee (if not already paid and not waived)
  if (appointment && !appointment.invoice_id && appointment.payment_status !== "paid" && appointment.payment_status !== "waived") {
    const fee = appointment.doctor?.consultation_fee || 0;
    if (fee > 0) {
      charges.push({
        id: `consultation-${appointment.id}`,
        type: "consultation",
        description: `Consultation Fee - Dr. ${appointment.doctor?.profiles?.full_name || "Doctor"}`,
        amount: fee,
        status: appointment.invoice_id ? "invoiced" : "pending",
        referenceId: appointment.id,
        doctorId: appointment.doctor?.id,
        serviceTypeId: consultationServiceType?.id,
      });
    }
  }

  // Lab order fees
  labOrders?.forEach((order) => {
    if (!order.invoice_id) {
      const totalAmount = order.items?.reduce((sum: number, item: any) => {
        // Use linked service_type price first
        if (item.service_type?.default_price) return sum + item.service_type.default_price;
        // Fallback: match by test_name against lab service types
        if (labServiceTypes && item.test_name) {
          const match = labServiceTypes.find(
            (st: any) => st.name.toLowerCase() === item.test_name.toLowerCase()
          );
          if (match?.default_price) return sum + match.default_price;
        }
        return sum;
      }, 0) || 0;
      
      charges.push({
        id: `lab-${order.id}`,
        type: "lab",
        description: `Lab Tests: ${order.items?.map((i: any) => i.test_name || i.service_type?.name || "Test").join(", ") || "Various tests"}`,
        amount: totalAmount,
        status: "pending",
        referenceId: order.id,
      });
    }
  });

  // Imaging order fees — resolve price via FK chain first, then fuzzy match
  imagingOrders?.forEach((order: any) => {
    if (!order.invoice_id) {
      let amount = 0;
      let matchedServiceTypeId: string | undefined;

      // 1. Try FK chain: imaging_procedure → service_types → default_price
      if (order.imaging_procedure?.service_types?.default_price) {
        amount = order.imaging_procedure.service_types.default_price;
        matchedServiceTypeId = order.imaging_procedure.service_types.id;
      }
      // 2. Try imaging_procedure base_price
      else if (order.imaging_procedure?.base_price) {
        amount = order.imaging_procedure.base_price;
        if (order.imaging_procedure?.service_type_id) {
          matchedServiceTypeId = order.imaging_procedure.service_type_id;
        }
      }
      // 3. Fuzzy match procedure_name against radiology service types (partial/contains)
      else if (radiologyServiceTypes && order.procedure_name) {
        const orderName = order.procedure_name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
        const match = radiologyServiceTypes.find((st: any) => {
          const stName = st.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
          return stName.includes(orderName) || orderName.includes(stName);
        });
        if (match?.default_price) {
          amount = match.default_price;
          matchedServiceTypeId = match.id;
        }
      }

      charges.push({
        id: `imaging-${order.id}`,
        type: "imaging",
        description: `${order.modality?.toUpperCase() || "Imaging"}: ${order.procedure_name}`,
        amount,
        status: "pending",
        referenceId: order.id,
        serviceTypeId: matchedServiceTypeId,
      });
    }
  });

  // Prescription items (if not dispensed through pharmacy)
  prescriptions?.forEach((rx) => {
    if (rx.status === "created") {
      const itemCount = rx.items?.length || 0;
      if (itemCount > 0) {
        charges.push({
          id: `rx-${rx.id}`,
          type: "prescription",
          description: `Prescription: ${itemCount} medicine(s) - Pending Dispensing`,
          amount: 0, // Pharmacy handles pricing
          status: "pending",
          referenceId: rx.id,
        });
      }
    }
  });

  const pendingCharges = charges.filter(c => c.status === "pending");
  const selectableCharges = pendingCharges.filter(c => c.amount > 0);
  const selectedTotal = pendingCharges
    .filter(c => selectedCharges.includes(c.id))
    .reduce((sum, c) => sum + c.amount, 0);

  const handleSelectAll = () => {
    if (selectedCharges.length === selectableCharges.length) {
      setSelectedCharges([]);
    } else {
      setSelectedCharges(selectableCharges.map(c => c.id));
    }
  };

  const handleToggleCharge = (id: string) => {
    setSelectedCharges(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleGenerateInvoice = async () => {
    if (!appointment || !profile?.organization_id || selectedCharges.length === 0) return;
    
    setIsProcessing(true);
    try {
      const itemsToInvoice = pendingCharges.filter(c => selectedCharges.includes(c.id));
      
      // Create invoice
      const invoiceData = await createInvoice.mutateAsync({
        patientId: appointment.patient_id,
        branchId: appointment.branch_id,
        items: itemsToInvoice.map(item => ({
          description: item.description,
          quantity: 1,
          unit_price: item.amount,
          discount_percent: 0,
          total_price: item.amount,
          doctor_id: item.doctorId,
          service_type_id: item.serviceTypeId,
        })),
        notes: `OPD Visit: ${generateVisitId(appointment)}`,
      });

      // Link invoice to appointment to prevent duplicate invoicing
      await supabase
        .from("appointments")
        .update({ invoice_id: invoiceData.id })
        .eq("id", appointment.id);

      // Link invoice to lab orders so DB trigger can sync payment_status
      const labCharges = itemsToInvoice.filter(c => c.type === 'lab');
      for (const charge of labCharges) {
        if (charge.referenceId) {
          const { error: labLinkErr } = await supabase
            .from('lab_orders')
            .update({ invoice_id: invoiceData.id })
            .eq('id', charge.referenceId);
          if (labLinkErr) console.error('Failed to link invoice to lab order:', labLinkErr);
        }
      }

      // Link invoice to imaging orders
      const imgCharges = itemsToInvoice.filter(c => c.type === 'imaging');
      for (const charge of imgCharges) {
        if (charge.referenceId) {
          const { error: imgLinkErr } = await supabase
            .from('imaging_orders')
            .update({ invoice_id: invoiceData.id })
            .eq('id', charge.referenceId);
          if (imgLinkErr) console.error('Failed to link invoice to imaging order:', imgLinkErr);
        }
      }

      setCreatedInvoiceId(invoiceData.id);

      // If insured, stay on page to show claim prompt; otherwise navigate
      if (billingSplit && !billingSplit.isSelfPay && billingSplit.insuranceAmount > 0) {
        toast.success("Invoice generated. You can now create an insurance claim.");
      } else {
        toast.success("Invoice generated successfully");
        navigate(`/app/billing/invoices/${invoiceData.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate invoice");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayNow = async () => {
    if (!appointment || !profile?.organization_id || selectedCharges.length === 0 || !paymentMethodId) return;
    
    setIsProcessing(true);
    try {
      const itemsToInvoice = pendingCharges.filter(c => selectedCharges.includes(c.id));
      
      // Create invoice
      const invoiceData = await createInvoice.mutateAsync({
        patientId: appointment.patient_id,
        branchId: appointment.branch_id,
        items: itemsToInvoice.map(item => ({
          description: item.description,
          quantity: 1,
          unit_price: item.amount,
          discount_percent: 0,
          total_price: item.amount,
          doctor_id: item.doctorId,
          service_type_id: item.serviceTypeId,
        })),
        notes: `OPD Visit: ${generateVisitId(appointment)}`,
      });

      // Link invoice to lab orders BEFORE payment so DB trigger finds them
      const labCharges = itemsToInvoice.filter(c => c.type === 'lab');
      const labOrderIds: string[] = [];
      for (const charge of labCharges) {
        if (charge.referenceId) {
          labOrderIds.push(charge.referenceId);
          const { error: labLinkErr } = await supabase
            .from('lab_orders')
            .update({ invoice_id: invoiceData.id })
            .eq('id', charge.referenceId);
          if (labLinkErr) console.error('Failed to link invoice to lab order:', labLinkErr);
        }
      }

      // Link invoice to imaging orders BEFORE payment
      const imgCharges = itemsToInvoice.filter(c => c.type === 'imaging');
      const imgOrderIds: string[] = [];
      for (const charge of imgCharges) {
        if (charge.referenceId) {
          imgOrderIds.push(charge.referenceId);
          const { error: imgLinkErr } = await supabase
            .from('imaging_orders')
            .update({ invoice_id: invoiceData.id })
            .eq('id', charge.referenceId);
          if (imgLinkErr) console.error('Failed to link invoice to imaging order:', imgLinkErr);
        }
      }

      // Record payment with session link (trigger will now find linked orders)
      await recordPayment.mutateAsync({
        invoiceId: invoiceData.id,
        amount: selectedTotal,
        paymentMethodId,
        billingSessionId: session?.id,
        notes: "OPD Checkout - Full Payment",
      });

      // Update appointment payment status
      await supabase
        .from("appointments")
        .update({ 
          invoice_id: invoiceData.id,
          payment_status: "paid" 
        })
        .eq("id", appointment.id);

      // Explicit payment_status sync (belt-and-suspenders)
      if (labOrderIds.length > 0) {
        await supabase
          .from('lab_orders')
          .update({ payment_status: 'paid' })
          .in('id', labOrderIds);
      }
      if (imgOrderIds.length > 0) {
        await supabase
          .from('imaging_orders')
          .update({ payment_status: 'paid' })
          .in('id', imgOrderIds);
      }

      setCreatedInvoiceId(invoiceData.id);

      // Invalidate caches to prevent stale data
      queryClient.invalidateQueries({ queryKey: ["pending-checkout"] });
      queryClient.invalidateQueries({ queryKey: ["opd-checkout-appointment", appointmentId] });

      // If insured, stay to show claim prompt
      if (billingSplit && !billingSplit.isSelfPay && billingSplit.insuranceAmount > 0) {
        toast.success("Payment recorded. You can now create an insurance claim.");
      } else {
        toast.success("Payment recorded successfully");
        navigate(`/app/billing/invoices/${invoiceData.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (appointmentLoading || sessionLoading) {
    return (
      <div className="container py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  // Block payment collection if no active session
  if (!hasActiveSession) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">OPD Checkout</h1>
            <p className="text-muted-foreground">Session required for payment collection</p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <SessionRequiredGuard
          counterType="reception"
          message="Open a billing session to collect OPD payments. This ensures all transactions are tracked for your shift."
        />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container py-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Appointment not found</p>
          <Button variant="link" onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </div>
    );
  }

  const visitId = generateVisitId(appointment);
  const patient = appointment.patient;

  return (
    <div className="container py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">OPD Checkout</h1>
          <p className="text-muted-foreground">Complete billing for visit {visitId}</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Session Status Banner */}
      <SessionStatusBanner counterType="reception" />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Charges List */}
        <div className="md:col-span-2 space-y-4">
          {/* Visit Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Visit Details</CardTitle>
                  <CardDescription>
                    {format(new Date(appointment.appointment_date), "MMMM d, yyyy")}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {visitId}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{patient?.first_name} {patient?.last_name}</p>
                  <p className="text-muted-foreground">{patient?.patient_number}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    Dr. {appointment.doctor?.profiles?.full_name || "Doctor"}
                  </p>
                  <p className="text-muted-foreground">{appointment.branch?.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Charges */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Pending Charges
                </CardTitle>
                {selectableCharges.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedCharges.length === selectableCharges.length ? "Deselect All" : "Select All"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {charges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p>All charges have been processed!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {charges.map((charge) => {
                    const Icon = charge.type === "consultation" ? Stethoscope 
                      : charge.type === "lab" ? TestTubes 
                      : charge.type === "imaging" ? Scan
                      : Pill;
                    const isSelected = selectedCharges.includes(charge.id);
                    const isPending = charge.status === "pending" && charge.amount > 0;
                    const isZeroPrice = charge.status === "pending" && charge.amount === 0;
                    
                    return (
                      <div
                        key={charge.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          isPending 
                            ? isSelected 
                              ? "border-primary bg-primary/5 cursor-pointer" 
                              : "border-border hover:border-primary/50 cursor-pointer"
                            : isZeroPrice
                              ? "border-border bg-muted/20 opacity-70"
                              : "border-border bg-muted/30 opacity-60"
                        }`}
                        onClick={() => isPending && handleToggleCharge(charge.id)}
                      >
                        <div className={`p-2 rounded-full ${
                          charge.type === "consultation" ? "bg-primary/10 text-primary" :
                          charge.type === "lab" ? "bg-secondary text-secondary-foreground" :
                          "bg-accent text-accent-foreground"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{charge.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {charge.status === "paid" && (
                              <Badge variant="default" className="text-xs">Paid</Badge>
                            )}
                            {charge.status === "invoiced" && (
                              <Badge variant="secondary" className="text-xs">Invoiced</Badge>
                            )}
                            {charge.status === "pending" && charge.amount === 0 && charge.type === "prescription" && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Pharmacy
                              </Badge>
                            )}
                            {charge.status === "pending" && charge.amount === 0 && charge.type !== "prescription" && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Pricing pending
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {charge.amount > 0 ? (
                            <p className="font-bold">{formatCurrency(charge.amount)}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">—</p>
                          )}
                        </div>
                        {isPending && (
                          <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                            isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                          }`}>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        <div className="space-y-4">
          {/* Insurance Claim Prompt (shown after invoice is created for insured patients) */}
          {createdInvoiceId && billingSplit && !billingSplit.isSelfPay && billingSplit.insuranceAmount > 0 && (
            <InsuranceClaimPrompt
              patientId={appointment.patient_id}
              invoiceId={createdInvoiceId}
              totalAmount={billingSplit.totalAmount}
              insuranceAmount={billingSplit.insuranceAmount}
              onDismiss={() => navigate(`/app/billing/invoices/${createdInvoiceId}`)}
            />
          )}

          {/* Insurance Billing Split */}
          {appointment.patient_id && selectedTotal > 0 && (
            <InsuranceBillingSplit
              patientId={appointment.patient_id}
              totalAmount={selectedTotal}
              onSplitCalculated={setBillingSplit}
              showHeader
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Selected Items</span>
                  <span>{selectedCharges.length}</span>
                </div>
                <Separator />
                {billingSplit && !billingSplit.isSelfPay && billingSplit.insuranceAmount > 0 ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Bill</span>
                      <span>{formatCurrency(selectedTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Insurance Covers</span>
                      <span>- {formatCurrency(billingSplit.insuranceAmount)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Patient Pays</span>
                      <span>{formatCurrency(billingSplit.patientResponsibility)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(selectedTotal)}</span>
                  </div>
                )}
              </div>

              {appointment?.payment_status === "paid" && selectableCharges.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-600">Already Paid</span>
                </div>
              ) : selectedCharges.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Payment Method</label>
                    <PaymentMethodSelector
                      value={paymentMethodId}
                      onValueChange={setPaymentMethodId}
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <Button 
                      className="w-full" 
                      onClick={handlePayNow}
                      disabled={!paymentMethodId || isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      Pay Now
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleGenerateInvoice}
                      disabled={isProcessing}
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Generate Invoice Only
                    </Button>
                  </div>
                </>
              )}

              {selectedCharges.length === 0 && pendingCharges.length > 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Select charges to proceed with payment
                </p>
              )}
            </CardContent>
          </Card>

          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => navigate("/app/opd")}
          >
            Skip & Return to OPD
          </Button>
        </div>
      </div>
    </div>
  );
}

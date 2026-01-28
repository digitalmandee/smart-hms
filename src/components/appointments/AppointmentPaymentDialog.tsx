import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Clock,
  AlertTriangle,
  Loader2,
  Stethoscope,
  Calendar,
} from "lucide-react";
import { PaymentMethodSelector } from "@/components/billing/PaymentMethodSelector";
import { formatCurrency } from "@/lib/currency";
import { useCreateInvoice, useRecordPayment } from "@/hooks/useBilling";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface AppointmentPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  patientName: string;
  patientNumber: string;
  doctorName: string;
  consultationFee: number;
  appointmentDate: string;
  appointmentTime: string | null;
  onPaymentComplete: () => void;
  onPayLater: () => void;
  isProcessing?: boolean;
}

export function AppointmentPaymentDialog({
  open,
  onOpenChange,
  appointmentId,
  patientName,
  patientNumber,
  doctorName,
  consultationFee,
  appointmentDate,
  appointmentTime,
  onPaymentComplete,
  onPayLater,
  isProcessing: externalProcessing = false,
}: AppointmentPaymentDialogProps) {
  const [amount, setAmount] = useState(consultationFee.toString());
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [showPayLaterWarning, setShowPayLaterWarning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const createInvoice = useCreateInvoice();
  const recordPayment = useRecordPayment();

  const formatTime = (time: string | null) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const handlePayNow = async () => {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!paymentMethodId) {
      toast.error("Please select a payment method");
      return;
    }

    setIsProcessing(true);
    try {
      // Get appointment details to get patient_id and branch_id
      const { data: appointment, error: aptError } = await supabase
        .from("appointments")
        .select("patient_id, branch_id, doctor_id, doctors(specialization)")
        .eq("id", appointmentId)
        .single();

      if (aptError || !appointment) {
        throw new Error("Appointment not found");
      }

      // 1. Create Invoice (include doctor_id for wallet earnings)
      const invoice = await createInvoice.mutateAsync({
        patientId: appointment.patient_id,
        branchId: appointment.branch_id,
        items: [{
          description: `Consultation Fee - Dr. ${doctorName}`,
          quantity: 1,
          unit_price: paymentAmount,
          doctor_id: appointment.doctor_id, // Link to doctor for wallet earnings
        }],
        status: "pending",
      });

      // 2. Record Payment
      await recordPayment.mutateAsync({
        invoiceId: invoice.id,
        amount: paymentAmount,
        paymentMethodId,
        referenceNumber: referenceNumber || undefined,
        notes: notes || `Consultation payment for appointment`,
      });

      // 3. Update appointment with payment_status and invoice_id
      const newPaymentStatus = paymentAmount >= consultationFee ? "paid" : "partial";
      
      // Use raw update to handle new columns that might not be in types yet
      const { error: updateError } = await supabase
        .from("appointments")
        .update({
          invoice_id: invoice.id,
          payment_status: newPaymentStatus,
        } as Record<string, unknown>)
        .eq("id", appointmentId);

      if (updateError) {
        console.error("Failed to update appointment:", updateError);
        // Don't throw - payment was still successful
      }

      toast.success("Payment recorded successfully", {
        description: `Invoice ${invoice.invoice_number} created`,
      });

      onPaymentComplete();
    } catch (error: any) {
      toast.error("Payment failed", {
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayLater = () => {
    if (!showPayLaterWarning) {
      setShowPayLaterWarning(true);
      return;
    }
    onPayLater();
  };

  const processing = isProcessing || externalProcessing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Consultation Payment
          </DialogTitle>
          <DialogDescription>
            Collect consultation fee for the appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Appointment Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-lg">{patientName}</p>
                {patientNumber && (
                  <p className="text-sm text-muted-foreground">{patientNumber}</p>
                )}
              </div>
              <Badge variant="outline">Appointment</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(appointmentDate), "MMM dd, yyyy")}
              </span>
              {appointmentTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(appointmentTime)}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Dr. {doctorName}
            </p>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Consultation Fee:</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(consultationFee)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Payment Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={0}
                step={100}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(consultationFee.toString())}
                >
                  Full Amount
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount((consultationFee / 2).toString())}
                >
                  50%
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Payment Method</Label>
              <PaymentMethodSelector
                value={paymentMethodId}
                onValueChange={setPaymentMethodId}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reference">Reference Number (Optional)</Label>
              <Input
                id="reference"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Transaction ID, Check number, etc."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>
          </div>

          {/* Pay Later Warning */}
          {showPayLaterWarning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Are you sure?</p>
                <p className="text-sm">
                  The appointment will remain tentative. Payment of{" "}
                  {formatCurrency(consultationFee)} must be collected before consultation.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="secondary"
            onClick={handlePayLater}
            disabled={processing}
            className="w-full sm:w-auto"
          >
            <Clock className="h-4 w-4 mr-2" />
            {showPayLaterWarning ? "Confirm Pay Later" : "Pay Later"}
          </Button>
          <Button
            onClick={handlePayNow}
            disabled={processing || !paymentMethodId || parseFloat(amount) <= 0}
            className="w-full sm:w-auto"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Collect Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

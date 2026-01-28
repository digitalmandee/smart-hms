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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Clock,
  AlertTriangle,
  ShieldOff,
  Stethoscope,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface PaymentRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  doctorName: string;
  consultationFee: number;
  paymentStatus: "pending" | "partial" | "waived";
  onPayNow: () => void;
  onPayLater: () => void;
  onWaive: () => void;
}

export function PaymentRequiredDialog({
  open,
  onOpenChange,
  patientName,
  doctorName,
  consultationFee,
  paymentStatus,
  onPayNow,
  onPayLater,
  onWaive,
}: PaymentRequiredDialogProps) {
  const [showPayLaterWarning, setShowPayLaterWarning] = useState(false);

  const handlePayLater = () => {
    if (!showPayLaterWarning) {
      setShowPayLaterWarning(true);
      return;
    }
    onPayLater();
  };

  const handleClose = () => {
    setShowPayLaterWarning(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Payment Required
          </DialogTitle>
          <DialogDescription>
            Consultation fee is pending for this appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Appointment Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{patientName}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  Dr. {doctorName}
                </p>
              </div>
              <Badge 
                variant={paymentStatus === "pending" ? "destructive" : "secondary"}
                className="capitalize"
              >
                {paymentStatus}
              </Badge>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Consultation Fee:</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(consultationFee)}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          {showPayLaterWarning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Are you sure?</p>
                <p className="text-sm">
                  Patient will proceed without payment. Fee of{" "}
                  {formatCurrency(consultationFee)} must be collected at checkout.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <p className="text-sm text-muted-foreground">
            How would you like to proceed with this check-in?
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onPayNow} className="w-full">
            <CreditCard className="h-4 w-4 mr-2" />
            Collect Payment Now
          </Button>
          <div className="flex gap-2 w-full">
            <Button
              variant="secondary"
              onClick={handlePayLater}
              className="flex-1"
            >
              <Clock className="h-4 w-4 mr-2" />
              {showPayLaterWarning ? "Confirm Pay Later" : "Pay Later"}
            </Button>
            <Button
              variant="outline"
              onClick={onWaive}
              className="flex-1"
            >
              <ShieldOff className="h-4 w-4 mr-2" />
              Waive Fee
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

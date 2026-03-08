import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScanBarcode, Send, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

interface TatmeenScanButtonProps {
  patientId?: string;
  prescriptionId?: string;
  onScanComplete?: (data: { gtin: string; serial_number: string; batch_number: string }) => void;
  disabled?: boolean;
}

export function TatmeenScanButton({
  patientId,
  prescriptionId,
  onScanComplete,
  disabled,
}: TatmeenScanButtonProps) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { country_code } = useCountryConfig();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);

  const [transactionType, setTransactionType] = useState<string>("dispense");
  const [gtin, setGtin] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState("1");

  if (country_code !== "SA") return null;

  const parseGS1Barcode = (barcode: string) => {
    // GS1 DataMatrix parser: (01)GTIN(21)Serial(10)Batch(17)Expiry
    const gtinMatch = barcode.match(/\(01\)(\d{14})/);
    const serialMatch = barcode.match(/\(21\)([^\(]+)/);
    const batchMatch = barcode.match(/\(10\)([^\(]+)/);
    const expiryMatch = barcode.match(/\(17\)(\d{6})/);

    if (gtinMatch) setGtin(gtinMatch[1]);
    if (serialMatch) setSerialNumber(serialMatch[1]);
    if (batchMatch) setBatchNumber(batchMatch[1]);
    if (expiryMatch) {
      const exp = expiryMatch[1];
      setExpiryDate(`20${exp.slice(0, 2)}-${exp.slice(2, 4)}-${exp.slice(4, 6)}`);
    }
  };

  const handleSubmit = async () => {
    if (!profile?.organization_id || !gtin) return;
    setIsSubmitting(true);

    try {
      // Create transaction record
      const { data: txn, error: insertError } = await supabase
        .from("tatmeen_transactions")
        .insert({
          organization_id: profile.organization_id,
          transaction_type: transactionType,
          gtin,
          serial_number: serialNumber || null,
          batch_number: batchNumber || null,
          expiry_date: expiryDate || null,
          quantity: parseInt(quantity) || 1,
          patient_id: patientId || null,
          prescription_id: prescriptionId || null,
          created_by: profile.id,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Submit to Tatmeen gateway
      const { data: result, error: fnError } = await supabase.functions.invoke(
        "tatmeen-gateway",
        {
          body: {
            action: "report_movement",
            transaction_id: txn.id,
            transaction_data: {
              transaction_type: transactionType,
              gtin,
              serial_number: serialNumber,
              batch_number: batchNumber,
              quantity: parseInt(quantity),
              facility_gln: profile.organization_id,
            },
          },
        }
      );

      if (fnError) throw fnError;

      setVerified(true);
      onScanComplete?.({ gtin, serial_number: serialNumber, batch_number: batchNumber });
      toast.success(t("tatmeen.reported" as any, "Drug movement reported to Tatmeen"));

      setTimeout(() => {
        setOpen(false);
        setVerified(false);
        setGtin("");
        setSerialNumber("");
        setBatchNumber("");
      }, 1500);
    } catch (err) {
      console.error("Tatmeen error:", err);
      toast.error(t("tatmeen.error" as any, "Failed to report to Tatmeen"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={disabled}>
          <ScanBarcode className="h-4 w-4" />
          {t("tatmeen.scanButton" as any, "Tatmeen Scan")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanBarcode className="h-5 w-5 text-primary" />
            {t("tatmeen.title" as any, "Tatmeen Drug Track & Trace")}
          </DialogTitle>
        </DialogHeader>

        {verified ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <p className="text-lg font-medium">{t("tatmeen.verified" as any, "Reported Successfully")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("tatmeen.scanBarcode" as any, "Scan GS1 Barcode")}</Label>
              <Input
                placeholder={t("tatmeen.scanPlaceholder" as any, "Scan or paste GS1 DataMatrix...")}
                onChange={(e) => parseGS1Barcode(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>{t("tatmeen.transactionType" as any, "Transaction Type")}</Label>
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="receive">{t("tatmeen.receive" as any, "Receive")}</SelectItem>
                  <SelectItem value="dispense">{t("tatmeen.dispense" as any, "Dispense")}</SelectItem>
                  <SelectItem value="return">{t("tatmeen.return" as any, "Return")}</SelectItem>
                  <SelectItem value="transfer">{t("tatmeen.transfer" as any, "Transfer")}</SelectItem>
                  <SelectItem value="destroy">{t("tatmeen.destroy" as any, "Destroy")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>GTIN *</Label>
                <Input value={gtin} onChange={(e) => setGtin(e.target.value)} placeholder="14-digit GTIN" />
              </div>
              <div className="space-y-2">
                <Label>{t("tatmeen.serial" as any, "Serial Number")}</Label>
                <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>{t("tatmeen.batch" as any, "Batch")}</Label>
                <Input value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("tatmeen.expiry" as any, "Expiry")}</Label>
                <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("tatmeen.quantity" as any, "Qty")}</Label>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" />
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={isSubmitting || !gtin} className="w-full gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {t("tatmeen.report" as any, "Report to SFDA")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

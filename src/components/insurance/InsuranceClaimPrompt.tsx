import { useTranslation } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, ArrowRight, X } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useState } from "react";

interface InsuranceClaimPromptProps {
  patientId: string;
  invoiceId: string;
  totalAmount: number;
  insuranceAmount: number;
  icdCodes?: string;
  preAuthNumber?: string;
  admissionId?: string;
  onDismiss?: () => void;
}

export function InsuranceClaimPrompt({
  patientId,
  invoiceId,
  totalAmount,
  insuranceAmount,
  icdCodes,
  preAuthNumber,
  admissionId,
  onDismiss,
}: InsuranceClaimPromptProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || insuranceAmount <= 0) return null;

  const handleCreateClaim = () => {
    const params = new URLSearchParams();
    params.set("invoice", invoiceId);
    params.set("patient", patientId);
    if (preAuthNumber) params.set("preauth", preAuthNumber);
    if (icdCodes) params.set("icd_codes", icdCodes);
    if (admissionId) params.set("admission_id", admissionId);

    navigate(`/app/insurance/claims/new?${params.toString()}`);
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">
                {t("insPrompt.title", "Insurance Claim Available")}
              </h4>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDismiss}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("insPrompt.description", "An insurance claim can be submitted for this visit.")}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t("insBilling.totalBill", "Total Bill")}: </span>
                <span className="font-medium">{formatCurrency(totalAmount)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("insPrompt.claimable", "Claimable")}: </span>
                <Badge variant="default" className="text-xs">
                  {formatCurrency(insuranceAmount)}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleCreateClaim}>
                <FileText className="h-3.5 w-3.5 me-1" />
                {t("insPrompt.createClaim", "Create Insurance Claim")}
                <ArrowRight className="h-3.5 w-3.5 ms-1" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                {t("insPrompt.skip", "Skip")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

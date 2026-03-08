import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { generateQRCodeUrl } from "@/lib/qrcode";
import { QrCode, CheckCircle, XCircle, Loader2, RefreshCw, AlertTriangle } from "lucide-react";

interface ZatcaQRDisplayProps {
  zatcaQrCode?: string | null;
  zatcaUuid?: string | null;
  zatcaIcv?: number | null;
  zatcaClearanceStatus?: string | null;
  zatcaInvoiceHash?: string | null;
  isGenerating?: boolean;
  onGenerate?: () => void;
  compact?: boolean;
}

export function ZatcaQRDisplay({
  zatcaQrCode,
  zatcaUuid,
  zatcaIcv,
  zatcaClearanceStatus,
  zatcaInvoiceHash,
  isGenerating = false,
  onGenerate,
  compact = false,
}: ZatcaQRDisplayProps) {
  const { t } = useTranslation();
  const { country_code, e_invoicing_enabled } = useCountryConfig();

  // Only show for KSA with e-invoicing enabled
  if (country_code !== 'SA' || !e_invoicing_enabled) {
    return null;
  }

  const hasQR = !!zatcaQrCode;
  const qrImageUrl = zatcaQrCode ? generateQRCodeUrl(zatcaQrCode, 150) : null;

  const getStatusBadge = () => {
    if (!hasQR) {
      return (
        <Badge variant="outline" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {t("zatca.notGenerated" as any, "Not Generated")}
        </Badge>
      );
    }

    switch (zatcaClearanceStatus) {
      case 'cleared':
        return (
          <Badge variant="default" className="gap-1 bg-emerald-600 dark:bg-emerald-700">
            <CheckCircle className="h-3 w-3" />
            {t("zatca.cleared" as any, "Cleared")}
          </Badge>
        );
      case 'reported':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {t("zatca.reported" as any, "Reported")}
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t("zatca.pending" as any, "Pending")}
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {t("zatca.failed" as any, "Failed")}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {t("zatca.generated" as any, "Generated")}
          </Badge>
        );
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
        {hasQR ? (
          <>
            <img src={qrImageUrl!} alt="ZATCA QR" className="w-12 h-12" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t("zatca.title" as any, "ZATCA E-Invoice")}</p>
              {getStatusBadge()}
            </div>
          </>
        ) : (
          <>
            <QrCode className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t("zatca.title" as any, "ZATCA E-Invoice")}</p>
              {getStatusBadge()}
            </div>
            {onGenerate && (
              <Button size="sm" onClick={onGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("zatca.generate" as any, "Generate")
                )}
              </Button>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          {t("zatca.title" as any, "ZATCA E-Invoice")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasQR ? (
          <>
            <div className="flex items-start gap-4">
              <img src={qrImageUrl!} alt="ZATCA QR" className="w-24 h-24 border rounded" />
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("common.status", "Status")}</span>
                  {getStatusBadge()}
                </div>
                {zatcaUuid && (
                  <div>
                    <span className="text-sm text-muted-foreground">UUID</span>
                    <p className="text-xs font-mono truncate">{zatcaUuid}</p>
                  </div>
                )}
                {zatcaIcv !== null && zatcaIcv !== undefined && (
                  <div>
                    <span className="text-sm text-muted-foreground">ICV</span>
                    <p className="font-medium">{zatcaIcv}</p>
                  </div>
                )}
              </div>
            </div>

            {zatcaInvoiceHash && (
              <>
                <Separator />
                <div>
                  <span className="text-xs text-muted-foreground">{t("zatca.invoiceHash" as any, "Invoice Hash")}</span>
                  <p className="text-xs font-mono truncate">{zatcaInvoiceHash}</p>
                </div>
              </>
            )}

            {onGenerate && (
              <>
                <Separator />
                <Button variant="outline" size="sm" onClick={onGenerate} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {t("zatca.regenerate" as any, "Regenerate QR")}
                </Button>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-4 space-y-3">
            <QrCode className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">{t("zatca.notGenerated" as any, "QR Code Not Generated")}</p>
              <p className="text-sm text-muted-foreground">
                {t("zatca.generateDescription" as any, "Generate ZATCA-compliant QR code for this invoice")}
              </p>
            </div>
            {onGenerate && (
              <Button onClick={onGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.generating" as any, "Generating...")}
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    {t("zatca.generate" as any, "Generate ZATCA QR")}
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Copy, Check, Download } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  codes: string[];
  userLabel?: string;
}

export function RecoveryCodesDialog({ open, onOpenChange, codes, userLabel }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const allCodes = codes.join("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(allCodes);
    setCopied(true);
    toast.success(t("mfa.recovery.copied") as string);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([
      `Recovery codes${userLabel ? ` for ${userLabel}` : ""}\nGenerated: ${new Date().toISOString()}\n\n${allCodes}\n\nKeep these codes safe. Each code can only be used once.\n`,
    ], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recovery-codes-${userLabel || "user"}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("mfa.recovery.title")}</DialogTitle>
          <DialogDescription>{t("mfa.recovery.desc")}</DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{t("mfa.recovery.warning")}</AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-md font-mono text-sm">
          {codes.map((c, i) => (
            <div key={i} className="py-1">{c}</div>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" /> {t("mfa.recovery.download")}
          </Button>
          <Button onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {t("mfa.recovery.copy_all")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

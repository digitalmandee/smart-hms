import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Download, MessageCircle, Mail, QrCode } from "lucide-react";
import { toast } from "sonner";
import { generateQRCodeUrl, getCampaignPublicUrl } from "@/lib/qrcode";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CampaignShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: {
    title: string;
    campaign_number: string;
  };
}

export function CampaignShareDialog({ open, onOpenChange, campaign }: CampaignShareDialogProps) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: orgSlug } = useQuery({
    queryKey: ["org-slug", profile?.organization_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("organizations")
        .select("slug")
        .eq("id", profile!.organization_id!)
        .single();
      return data?.slug || "org";
    },
    enabled: !!profile?.organization_id && open,
  });

  const publicUrl = getCampaignPublicUrl(orgSlug || "org", campaign.campaign_number);
  const qrUrl = generateQRCodeUrl(publicUrl, 300);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success(t("donations.linkCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `campaign-qr-${campaign.campaign_number}.png`;
    link.click();
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${campaign.title}\n\n${publicUrl}`)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(campaign.title)}&body=${encodeURIComponent(`Check out this campaign:\n\n${campaign.title}\n${publicUrl}`)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            {t("donations.shareCampaign")}
          </DialogTitle>
          <DialogDescription>{campaign.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <img src={qrUrl} alt="Campaign QR Code" className="w-48 h-48" />
          </div>

          {/* Public URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("donations.publicLink")}</label>
            <div className="flex gap-2">
              <Input value={publicUrl} readOnly className="text-xs" />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleDownloadQR}>
              <Download className="h-4 w-4 mr-2" />
              {t("donations.downloadQR")}
            </Button>
            <Button variant="outline" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 mr-2" />
                {t("donations.shareViaWhatsApp")}
              </a>
            </Button>
          </div>
          <Button variant="outline" className="w-full" asChild>
            <a href={emailUrl}>
              <Mail className="h-4 w-4 mr-2" />
              {t("donations.shareViaEmail")}
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

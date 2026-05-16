import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, MessageCircle, Loader2, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function WhatsAppSettingsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; sandbox?: boolean; message: string } | null>(null);

  const runDispatcher = async () => {
    setTesting(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-dispatch", {
        body: { limit: 5 },
      });
      if (error) throw error;
      setResult({
        ok: true,
        sandbox: data?.sandbox,
        message: data?.sandbox
          ? t("whatsapp.test.sandbox" as any, "Sandbox mode — no credentials configured. Processed {n} queued message(s).").replace("{n}", String(data?.processed ?? 0))
          : t("whatsapp.test.live" as any, "Live mode — processed {n} queued message(s).").replace("{n}", String(data?.processed ?? 0)),
      });
    } catch (err: any) {
      setResult({ ok: false, message: err?.message || String(err) });
      toast({ title: "Error", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("whatsapp.title" as any, "WhatsApp Business")}
        description={t("whatsapp.description" as any, "Configure WhatsApp Business Cloud for patient notifications")}
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{t("whatsapp.testConnection" as any, "Test Dispatcher")}</CardTitle>
          <div className="flex items-center gap-2">
            {result && (
              <Badge variant={result.ok ? "default" : "destructive"}>
                {result.ok ? (result.sandbox ? "🧪 Sandbox" : "✅ Live") : "❌ Failed"}
              </Badge>
            )}
            <Button size="sm" disabled={testing} onClick={runDispatcher}>
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <PlayCircle className="h-4 w-4 mr-1" />}
              {t("common.test" as any, "Test")}
            </Button>
          </div>
        </CardHeader>
        {result && (
          <CardContent>
            <p className={`text-sm ${result.ok ? "text-muted-foreground" : "text-destructive"}`}>{result.message}</p>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <CardTitle>{t("whatsapp.config" as any, "WhatsApp Configuration")}</CardTitle>
          </div>
          <CardDescription>
            {t("whatsapp.configDesc" as any, "Add your Meta WhatsApp Business Cloud credentials. These are stored as Supabase Edge Function secrets.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4 flex gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                {t(
                  "whatsapp.secretsInfo" as any,
                  "Credentials (WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID) must be added as Edge Function secrets in the Supabase dashboard."
                )}
              </p>
              <p>
                {t(
                  "whatsapp.sandboxNote" as any,
                  "Without credentials, the dispatcher runs in sandbox mode and marks messages as sent without contacting Meta."
                )}
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("whatsapp.phoneNumberId" as any, "Phone Number ID")}</Label>
              <Input placeholder="WHATSAPP_PHONE_NUMBER_ID" disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>{t("whatsapp.token" as any, "Access Token")}</Label>
              <Input placeholder="WHATSAPP_TOKEN" disabled className="bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

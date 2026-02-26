import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useOPDDepartments } from "@/hooks/useOPDDepartments";
import { useTranslation } from "@/lib/i18n";
import { Copy, Check, Monitor, Ticket, AlertTriangle, ExternalLink, Building2, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function KioskSetupPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const organizationId = profile?.organization_id;
  const baseUrl = window.location.origin;

  const { data: departments, isLoading: deptsLoading } = useOPDDepartments();

  const publicUrls = [
    {
      id: "opd-display",
      title: t("opd.opdQueueDisplayTv" as any, "OPD Queue Display (TV)"),
      description: t("opd.opdQueueDisplayDesc" as any, "Large screen display for waiting room TVs showing current token and queue"),
      url: `${baseUrl}/display/queue/${organizationId}`,
      icon: Monitor,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      id: "er-display",
      title: t("opd.erQueueDisplayTv" as any, "ER Queue Display (TV)"),
      description: t("opd.erQueueDisplayDesc" as any, "Emergency department display showing triage zones and incoming ambulances"),
      url: `${baseUrl}/display/er/${organizationId}`,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      id: "kiosk",
      title: t("opd.selfServiceKiosk" as any, "Self-Service Token Kiosk"),
      description: t("opd.selfServiceKioskDesc" as any, "Patient-facing kiosk for self-service token generation and printing"),
      url: `${baseUrl}/kiosk/${organizationId}`,
      icon: Ticket,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ];

  const handleCopy = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(id);
      toast({ title: t("opd.copied" as any, "Copied!") });
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleOpen = (url: string) => {
    window.open(url, "_blank");
  };

  if (!organizationId) {
    return (
      <div className="p-6">
        <PageHeader
          title={t("opd.tokenAndDisplaySetup" as any, "Token & Display Setup")}
          description={t("opd.configureDisplays" as any, "Configure public displays and kiosks")}
        />
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Please ensure you are logged in to view setup URLs.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t("opd.tokenAndDisplaySetup" as any, "Token & Display Setup")}
        description={t("opd.configureDisplays" as any, "Configure public TV displays and self-service kiosks for your organization")}
      />

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-amber-700 dark:text-amber-400">
            {t("opd.publicUrlsWarning" as any, "These are public URLs - no login required")}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("opd.publicUrlsDescription" as any, "Copy the appropriate URL and open it in a browser on your waiting room TV, reception monitor, or kiosk tablet. The displays will auto-refresh and show live queue information.")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {publicUrls.map((item) => {
          const Icon = item.icon;
          const isCopied = copiedUrl === item.id;

          return (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className={item.bgColor}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-background/80 ${item.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <CardDescription>{item.description}</CardDescription>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("opd.publicUrl" as any, "Public URL")}</label>
                  <div className="flex gap-2">
                    <Input
                      value={item.url}
                      readOnly
                      className="text-xs font-mono bg-muted"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleCopy(item.url, item.id)}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-emerald-500" />
                        {t("opd.copied" as any, "Copied!")}
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        {t("opd.copyUrl" as any, "Copy URL")}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleOpen(item.url)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t("common.preview" as any, "Preview")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Department-Specific Displays */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t("opd.departmentSpecificDisplays" as any, "Department-Specific Displays")}</CardTitle>
          </div>
          <CardDescription>
            {t("opd.deptSpecificDesc" as any, "Each OPD department can have its own waiting room TV display showing only that department's queue.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deptsLoading ? (
            <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : !departments || departments.length === 0 ? (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                {t("opd.noDepartmentsConfigured" as any, "No OPD departments configured. Go to Settings > OPD Departments to add them. Without departments, the main OPD display URL shows all tokens.")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => {
                const deptUrl = `${baseUrl}/display/queue/${organizationId}/${dept.code}`;
                const copyId = `dept-${dept.id}`;
                const isCopied = copiedUrl === copyId;

                return (
                  <div
                    key={dept.id}
                    className="rounded-lg border p-4 space-y-3"
                    style={{ borderColor: `${dept.color || "#3b82f6"}40` }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: dept.color || "#3b82f6" }}
                      />
                      <span className="font-medium">{dept.name}</span>
                      <Badge variant="outline" className="ml-auto font-mono text-xs"
                        style={{ borderColor: dept.color || "#3b82f6", color: dept.color || "#3b82f6" }}>
                        {dept.code}
                      </Badge>
                    </div>

                    <Input
                      value={deptUrl}
                      readOnly
                      className="text-xs font-mono bg-muted"
                    />

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleCopy(deptUrl, copyId)}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                            {t("opd.copied" as any, "Copied!")}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 mr-1.5" />
                            {t("common.copy" as any, "Copy")}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpen(deptUrl)}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        {t("common.preview" as any, "Preview")}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("opd.setupInstructions" as any, "Setup Instructions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">{t("opd.forWaitingRoomTvs" as any, "For Waiting Room TVs")}</h4>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                <li>Copy the "OPD Queue Display" or department-specific URL</li>
                <li>Open Chrome/Firefox on the TV computer</li>
                <li>Paste the URL and press Enter</li>
                <li>Press F11 for fullscreen mode</li>
                <li>The display will auto-refresh every 5 seconds</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">{t("opd.forSelfServiceKiosks" as any, "For Self-Service Kiosks")}</h4>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                <li>Copy the "Self-Service Token Kiosk" URL</li>
                <li>Open on a touch-screen tablet or kiosk</li>
                <li>Connect a thermal printer for token printing</li>
                <li>Patients can enter phone and select doctor</li>
                <li>Token is generated and can be printed</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

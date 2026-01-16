import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Copy, Check, Monitor, Ticket, AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function KioskSetupPage() {
  const { profile } = useAuth();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const organizationId = profile?.organization_id;
  const baseUrl = window.location.origin;

  const publicUrls = [
    {
      id: "opd-display",
      title: "OPD Queue Display (TV)",
      description: "Large screen display for waiting room TVs showing current token and queue",
      url: `${baseUrl}/display/queue/${organizationId}`,
      icon: Monitor,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      id: "er-display",
      title: "ER Queue Display (TV)",
      description: "Emergency department display showing triage zones and incoming ambulances",
      url: `${baseUrl}/display/er/${organizationId}`,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      id: "kiosk",
      title: "Self-Service Token Kiosk",
      description: "Patient-facing kiosk for self-service token generation and printing",
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
      toast({ title: "URL copied to clipboard!" });
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
          title="Token & Display Setup"
          description="Configure public displays and kiosks"
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
        title="Token & Display Setup"
        description="Configure public TV displays and self-service kiosks for your organization"
      />

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-amber-700 dark:text-amber-400">
            These are public URLs - no login required
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Copy the appropriate URL and open it in a browser on your waiting room TV, 
            reception monitor, or kiosk tablet. The displays will auto-refresh and show 
            live queue information.
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
                  <label className="text-sm font-medium">Public URL</label>
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
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleOpen(item.url)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">For Waiting Room TVs</h4>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                <li>Copy the "OPD Queue Display" or "ER Queue Display" URL</li>
                <li>Open Chrome/Firefox on the TV computer</li>
                <li>Paste the URL and press Enter</li>
                <li>Press F11 for fullscreen mode</li>
                <li>The display will auto-refresh every 5 seconds</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">For Self-Service Kiosks</h4>
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

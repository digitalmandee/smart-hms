import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck } from "lucide-react";
import { useTranslation, useIsRTL, type TranslationKey } from "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { MfaRosterTable } from "@/components/mfa/MfaRosterTable";

const PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_ID;

interface Item {
  id: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  link: string;
  status: "manual-check" | "configured" | "warning";
  steps: string[];
}

const items: Item[] = [
  {
    id: "leaked-password",
    titleKey: "security.item.leaked_password.title",
    descKey: "security.item.leaked_password.desc",
    link: `https://supabase.com/dashboard/project/${PROJECT_REF}/auth/policies`,
    status: "manual-check",
    steps: [
      "Open Supabase Auth → Sign In / Up → Auth Policies",
      "Toggle 'Enable leaked password protection' ON",
      "Save",
    ],
  },
  {
    id: "otp-expiry",
    titleKey: "security.item.otp_expiry.title",
    descKey: "security.item.otp_expiry.desc",
    link: `https://supabase.com/dashboard/project/${PROJECT_REF}/auth/providers`,
    status: "manual-check",
    steps: [
      "Open Supabase Auth → Providers → Email",
      "Set 'OTP Expiry duration' to 3600 seconds (1 hour) or less",
      "Save",
    ],
  },
  {
    id: "mfa-enforcement",
    titleKey: "security.item.mfa.title",
    descKey: "security.item.mfa.desc",
    link: "/app/profile/security",
    status: "manual-check",
    steps: [
      "Each admin opens Profile → Security",
      "Click 'Enroll authenticator app' and scan the QR with Google Authenticator / Authy",
      "Verify the 6-digit code",
    ],
  },
  {
    id: "pitr",
    titleKey: "security.item.pitr.title",
    descKey: "security.item.pitr.desc",
    link: `https://supabase.com/dashboard/project/${PROJECT_REF}/settings/addons`,
    status: "manual-check",
    steps: [
      "Open Supabase Settings → Add-ons",
      "Enable 'Point in Time Recovery'",
      "After enabling, run a restore drill (see Runbooks → Backup & Restore)",
    ],
  },
  {
    id: "storage-rls",
    titleKey: "security.item.storage_rls.title",
    descKey: "security.item.storage_rls.desc",
    link: `https://supabase.com/dashboard/project/${PROJECT_REF}/storage/buckets`,
    status: "manual-check",
    steps: [
      "Open Supabase Storage → Buckets",
      "Confirm each PHI bucket is marked Private (no green 'Public' badge)",
      "Open Policies tab → confirm all access policies reference organization_id",
    ],
  },
];

export default function SecuritySetupPage() {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const { hasRole, isSuperAdmin } = useAuth();
  const canManageMfa = isSuperAdmin || hasRole("org_admin") || hasRole("branch_admin");

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <PageHeader
        title={t("security.page_title")}
        description={t("security.page_description")}
      />

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className={`flex ${isRTL ? "flex-row-reverse" : "flex-row"} items-center gap-3 space-y-0`}>
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div className={isRTL ? "text-end" : ""}>
            <CardTitle className="text-base">{t("security.in_code_complete_title")}</CardTitle>
            <CardDescription>{t("security.in_code_complete_desc")}</CardDescription>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {items.map((it) => (
          <Card key={it.id}>
            <CardHeader>
              <div className={`flex items-start justify-between gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                <div className={`space-y-1 ${isRTL ? "text-end" : ""}`}>
                  <CardTitle className={`flex items-center gap-2 text-base ${isRTL ? "flex-row-reverse" : ""}`}>
                    {it.status === "configured" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    {t(it.titleKey)}
                  </CardTitle>
                  <CardDescription>{t(it.descKey)}</CardDescription>
                </div>
                <Badge variant={it.status === "configured" ? "default" : "secondary"}>
                  {it.status === "configured" ? t("security.status_configured") : t("security.status_manual")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className={`list-decimal space-y-1 ${isRTL ? "pr-5 text-end" : "pl-5"} text-sm text-muted-foreground`}>
                {it.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              <Button variant="outline" size="sm" asChild>
                <a href={it.link} target="_blank" rel="noreferrer">
                  {t("security.open_link")} <ExternalLink className={`${isRTL ? "mr-2" : "ml-2"} h-3 w-3`} />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("security.related_pages_title")}</CardTitle>
          <CardDescription>{t("security.related_pages_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" asChild>
            <a href="/app/admin/integration-health">{t("security.integration_health")}</a>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <a href="/app/admin/runbooks">{t("security.runbooks")}</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

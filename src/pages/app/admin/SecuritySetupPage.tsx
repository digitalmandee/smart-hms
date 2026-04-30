import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck } from "lucide-react";

const PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_ID;

interface Item {
  id: string;
  title: string;
  description: string;
  link: string;
  status: "manual-check" | "configured" | "warning";
  steps: string[];
}

const items: Item[] = [
  {
    id: "leaked-password",
    title: "Leaked Password Protection",
    description:
      "Blocks signups and password updates that use a password seen in known data breaches. Required for HIPAA-aligned auth.",
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
    title: "OTP Expiry ≤ 1 hour",
    description:
      "Magic-link / OTP codes should expire within 60 minutes to limit replay window.",
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
    title: "MFA Enforcement for Admins",
    description:
      "Super admins, org admins, branch admins, accountants, and finance managers must enroll TOTP MFA before accessing the app.",
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
    title: "Point-in-Time Recovery (PITR)",
    description:
      "Enables restoring the database to any second in the last 7 days. Requires Pro plan or higher.",
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
    title: "Storage Bucket RLS",
    description:
      "Every bucket holding patient documents, prescriptions, lab reports, or IDs must be private with org-scoped policies.",
    link: `https://supabase.com/dashboard/project/${PROJECT_REF}/storage/buckets`,
    status: "manual-check",
    steps: [
      "Open Supabase Storage → Buckets",
      "Confirm each PHI bucket is marked Private (no green 'Public' badge)",
      "Open Policies tab → confirm SELECT/INSERT/UPDATE/DELETE policies all reference organization_id",
    ],
  },
];

export default function SecuritySetupPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Setup"
        description="Production hardening checks that live outside the codebase. Tick each one off before go-live."
      />

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base">In-code hardening: complete</CardTitle>
            <CardDescription>
              Database functions locked down (Phase 1.1), edge functions require JWT
              and Zod validation (Phase 1.3), client + edge error reporting active (Phase 2),
              gateway idempotency + circuit breaker live (Phase 3).
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {items.map((it) => (
          <Card key={it.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {it.status === "configured" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    {it.title}
                  </CardTitle>
                  <CardDescription>{it.description}</CardDescription>
                </div>
                <Badge variant={it.status === "configured" ? "default" : "secondary"}>
                  {it.status === "configured" ? "Configured" : "Manual check"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                {it.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              <Button variant="outline" size="sm" asChild>
                <a href={it.link} target="_blank" rel="noreferrer">
                  Open <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

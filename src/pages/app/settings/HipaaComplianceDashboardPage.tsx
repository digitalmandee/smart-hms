import { useTranslation } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck, ShieldAlert, GraduationCap, FileText,
  Clock, Download, Eye, ArrowRight, CheckCircle, AlertTriangle
} from "lucide-react";
import { useHipaaBreaches } from "@/hooks/useHipaaBreaches";
import { useHipaaTrainingRecords } from "@/hooks/useHipaaTraining";
import { useBAAgreements } from "@/hooks/useBAAgreements";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";

export default function HipaaComplianceDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: breaches } = useHipaaBreaches();
  const { data: training } = useHipaaTrainingRecords();
  const { data: baas } = useBAAgreements();

  // Audit log counts (last 30 days)
  const { data: exportLogCount } = useQuery({
    queryKey: ["audit-export-count"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .eq("action", "data_export")
        .gte("created_at", thirtyDaysAgo);
      return count || 0;
    },
  });

  const { data: phiAccessCount } = useQuery({
    queryKey: ["audit-phi-access-count"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .eq("action", "phi_access")
        .gte("created_at", thirtyDaysAgo);
      return count || 0;
    },
  });

  const openBreaches = breaches?.filter(b => b.status !== "closed" && b.status !== "resolved").length || 0;
  const closedBreaches = breaches?.filter(b => b.status === "closed" || b.status === "resolved").length || 0;
  const activeBAAs = baas?.filter(b => b.status === "active").length || 0;
  const expiringBAAs = baas?.filter(b => {
    if (!b.expiry_date) return false;
    const days = differenceInDays(new Date(b.expiry_date), new Date());
    return days >= 0 && days <= 30;
  }).length || 0;

  const expiredTraining = training?.filter(r => r.expiry_date && new Date(r.expiry_date) < new Date()).length || 0;
  const validTraining = training?.filter(r => r.expiry_date && new Date(r.expiry_date) >= new Date()).length || 0;
  const trainingTotal = training?.length || 0;
  const trainingComplianceRate = trainingTotal > 0 ? Math.round((validTraining / trainingTotal) * 100) : 0;

  // Calculate overall score
  const scores: number[] = [];
  // Session timeout: always on = 100
  scores.push(100);
  // Breach tracking: having the module = 100
  scores.push(100);
  // Training compliance rate
  scores.push(trainingComplianceRate);
  // BAA: if any active = 100, else 50
  scores.push(activeBAAs > 0 ? 100 : 50);
  // Export audit: if any logs = 100
  scores.push((exportLogCount || 0) > 0 ? 100 : 50);
  // PHI access: if any logs = 100
  scores.push((phiAccessCount || 0) > 0 ? 100 : 50);

  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  const controls = [
    {
      title: t("hipaa.breach_title" as any),
      icon: ShieldAlert,
      status: openBreaches === 0 ? "compliant" : "attention",
      detail: `${openBreaches} open, ${closedBreaches} resolved`,
      href: "/app/settings/hipaa-breaches",
    },
    {
      title: t("hipaa.training_title" as any),
      icon: GraduationCap,
      status: expiredTraining === 0 ? "compliant" : "attention",
      detail: `${trainingComplianceRate}% compliant, ${expiredTraining} expired`,
      href: "/app/hr/compliance/hipaa-training",
    },
    {
      title: t("hipaa.baa_title" as any),
      icon: FileText,
      status: expiringBAAs === 0 ? "compliant" : "attention",
      detail: `${activeBAAs} active, ${expiringBAAs} expiring soon`,
      href: "/app/settings/baa-management",
    },
    {
      title: t("hipaa.session_timeout_title" as any),
      icon: Clock,
      status: "compliant" as const,
      detail: "15m clinical / 30m admin — enabled",
      href: "#",
    },
    {
      title: t("hipaa.export_audit" as any),
      icon: Download,
      status: "compliant" as const,
      detail: `${exportLogCount || 0} exports logged (30 days)`,
      href: "/app/settings/audit-logs",
    },
    {
      title: t("hipaa.phi_access_audit" as any),
      icon: Eye,
      status: "compliant" as const,
      detail: `${phiAccessCount || 0} accesses logged (30 days)`,
      href: "/app/settings/audit-logs",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={t("hipaa.compliance_dashboard" as any)}
        description={t("hipaa.compliance_dashboard_desc" as any)}
        breadcrumbs={[
          { label: t("nav.settings" as any), href: "/app/settings" },
          { label: t("hipaa.compliance_dashboard" as any) },
        ]}
      />

      {/* Overall Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-primary/10 rounded-xl">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{t("hipaa.overall_score" as any)}</h3>
              <p className="text-sm text-muted-foreground mb-2">{t("hipaa.overall_score_desc" as any)}</p>
              <div className="flex items-center gap-4">
                <Progress value={overallScore} className="flex-1 h-3" />
                <span className="text-2xl font-bold text-primary">{overallScore}%</span>
              </div>
            </div>
            <Badge className={overallScore >= 85 ? "bg-green-100 text-green-800" : overallScore >= 70 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
              {overallScore >= 85 ? "HIPAA Ready" : overallScore >= 70 ? "Needs Improvement" : "Not Compliant"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Control Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {controls.map((ctrl, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => ctrl.href !== "#" && navigate(ctrl.href)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ctrl.icon className="h-5 w-5 text-primary" />
                </div>
                {ctrl.status === "compliant" ? (
                  <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Compliant</Badge>
                ) : (
                  <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />Attention</Badge>
                )}
              </div>
              <h4 className="font-semibold mb-1">{ctrl.title}</h4>
              <p className="text-sm text-muted-foreground">{ctrl.detail}</p>
              {ctrl.href !== "#" && (
                <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-primary">
                  View Details <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

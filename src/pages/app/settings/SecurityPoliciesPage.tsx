import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import {
  Shield, Lock, Eye, Database, Clock, AlertTriangle, 
  FileText, Users, Key, Server, Wifi
} from "lucide-react";

const SecurityPoliciesPage = () => {
  const { t } = useTranslation();

  const safeguards = [
    {
      icon: Lock,
      title: t("security_policies.access_control"),
      status: "active",
      items: [
        t("security_policies.rls_all_tables"),
        t("security_policies.org_isolation"),
        t("security_policies.role_based_permissions"),
        t("security_policies.security_definer_functions"),
      ],
    },
    {
      icon: Key,
      title: t("security_policies.authentication"),
      status: "active",
      items: [
        t("security_policies.mfa_totp"),
        t("security_policies.session_timeout"),
        t("security_policies.password_policy"),
        t("security_policies.jwt_validation"),
      ],
    },
    {
      icon: Eye,
      title: t("security_policies.audit_controls"),
      status: "active",
      items: [
        t("security_policies.phi_access_logging"),
        t("security_policies.export_audit_trail"),
        t("security_policies.phi_field_masking"),
        t("security_policies.session_activity_tracking"),
      ],
    },
    {
      icon: Server,
      title: t("security_policies.data_transmission"),
      status: "active",
      items: [
        t("security_policies.tls_transit"),
        t("security_policies.cors_domain_allowlist"),
        t("security_policies.private_storage_buckets"),
        t("security_policies.signed_urls"),
      ],
    },
    {
      icon: Database,
      title: t("security_policies.data_integrity"),
      status: "active",
      items: [
        t("security_policies.encrypted_at_rest"),
        t("security_policies.automated_backups"),
        t("security_policies.data_retention_purge"),
        t("security_policies.idempotent_gl_posting"),
      ],
    },
    {
      icon: Clock,
      title: t("security_policies.session_management"),
      status: "active",
      items: [
        t("security_policies.idle_timeout_clinical"),
        t("security_policies.idle_timeout_admin"),
        t("security_policies.auto_signout"),
        t("security_policies.aal_step_up"),
      ],
    },
    {
      icon: AlertTriangle,
      title: t("security_policies.breach_response"),
      status: "active",
      items: [
        t("security_policies.breach_notification_workflow"),
        t("security_policies.60_day_deadline"),
        t("security_policies.affected_individual_tracking"),
        t("security_policies.hhs_reporting"),
      ],
    },
    {
      icon: Users,
      title: t("security_policies.workforce_compliance"),
      status: "active",
      items: [
        t("security_policies.training_tracking"),
        t("security_policies.baa_management"),
        t("security_policies.compliance_dashboard"),
        t("security_policies.role_attestation"),
      ],
    },
    {
      icon: Wifi,
      title: t("security_policies.realtime_security"),
      status: "active",
      items: [
        t("security_policies.realtime_rls"),
        t("security_policies.org_scoped_channels"),
        t("security_policies.server_side_filtering"),
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("security_policies.title")}
        description={t("security_policies.subtitle")}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t("security_policies.hipaa_safeguards")}
          </CardTitle>
          <CardDescription>
            {t("security_policies.hipaa_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {safeguards.map((sg, idx) => (
              <Card key={idx} className="border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <sg.icon className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">{sg.title}</CardTitle>
                    </div>
                    <Badge variant="default" className="text-[10px]">
                      {t("security_policies.active")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1">
                    {sg.items.map((item, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-success mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            {t("security_policies.manual_requirements")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="text-[10px] mt-0.5">{t("security_policies.manual")}</Badge>
              {t("security_policies.enable_leaked_password")}
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="text-[10px] mt-0.5">{t("security_policies.manual")}</Badge>
              {t("security_policies.enable_mfa_dashboard")}
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="text-[10px] mt-0.5">{t("security_policies.annual")}</Badge>
              {t("security_policies.pen_test")}
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="text-[10px] mt-0.5">{t("security_policies.annual")}</Badge>
              {t("security_policies.dr_drill")}
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityPoliciesPage;

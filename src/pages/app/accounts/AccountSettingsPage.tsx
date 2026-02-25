import { useNavigate } from "react-router-dom";
import { Settings, Tags, Calendar, Hash, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAccountTypes, useFiscalYears } from "@/hooks/useAccounts";

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { data: accountTypes } = useAccountTypes();
  const { data: fiscalYears } = useFiscalYears();

  const settingsItems = [
    {
      title: "Account Types",
      description: "Manage account types and categories for your chart of accounts",
      icon: Tags,
      path: "/app/accounts/types",
      count: accountTypes?.length || 0,
      countLabel: "types configured",
    },
    {
      title: "Fiscal Years",
      description: "Manage fiscal year periods and closing dates",
      icon: Calendar,
      path: "/app/accounts/budgets",
      count: fiscalYears?.length || 0,
      countLabel: "fiscal years",
    },
    {
      title: "Account Numbering",
      description: "Configure account number format and auto-generation",
      icon: Hash,
      path: "/app/accounts/chart-of-accounts",
      count: null,
      countLabel: null,
    },
    {
      title: "Report Templates",
      description: "Customize financial report formats and layouts",
      icon: FileText,
      path: "/app/settings/report-templates",
      count: null,
      countLabel: null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account Settings"
        description="Configure your accounting system settings"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Settings" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsItems.map((item) => (
          <Card
            key={item.title}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(item.path)}
          >
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {item.count !== null ? (
                  <span className="text-sm text-muted-foreground">
                    {item.count} {item.countLabel}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Click to configure
                  </span>
                )}
                <Button variant="ghost" size="sm">
                  Configure →
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { Plus } from "lucide-react";

export default function IssueReportingPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        title={t("housekeeping.issues" as any, "Issue Reporting")}
        description={t("housekeeping.issuesDesc" as any, "Report maintenance and cleanliness issues")}
        breadcrumbs={[
          { label: t("housekeeping.title" as any, "Housekeeping"), href: "/app/housekeeping" },
          { label: t("housekeeping.issues" as any, "Issues") },
        ]}
        actions={<Button><Plus className="mr-2 h-4 w-4" />Report Issue</Button>}
      />

      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Report maintenance/cleanliness issues, track resolution status, and assign to staff.
        </CardContent>
      </Card>
    </div>
  );
}

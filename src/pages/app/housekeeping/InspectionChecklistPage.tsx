import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";

export default function InspectionChecklistPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        title={t("housekeeping.inspections" as any, "Inspection Checklists")}
        description={t("housekeeping.inspectionsDesc" as any, "Configurable checklists per room type with inspector sign-off")}
        breadcrumbs={[
          { label: t("housekeeping.title" as any, "Housekeeping"), href: "/app/housekeeping" },
          { label: t("housekeeping.inspections" as any, "Inspections") },
        ]}
      />

      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Configure inspection checklists per room type. Inspector sign-off with photo evidence upload.
        </CardContent>
      </Card>
    </div>
  );
}

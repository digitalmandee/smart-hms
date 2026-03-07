import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AssetRegistryPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        title={t("assets.registry" as any, "Asset Registry")}
        description={t("assets.registryDesc" as any, "Manage equipment and medical devices")}
        breadcrumbs={[
          { label: t("assets.title" as any, "Assets"), href: "/app/assets" },
          { label: t("assets.registry" as any, "Registry") },
        ]}
        actions={<Button><Plus className="mr-2 h-4 w-4" />Add Equipment</Button>}
      />

      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Equipment CRUD — name, category, serial number, purchase date/cost, location, department, warranty expiry, vendor.
        </CardContent>
      </Card>
    </div>
  );
}

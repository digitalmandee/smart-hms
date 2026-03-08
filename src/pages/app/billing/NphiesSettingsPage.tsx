import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NphiesConfigPanel } from "@/components/insurance/NphiesConfigPanel";
import { WasfatyConfigPanel } from "@/components/pharmacy/WasfatyConfigPanel";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { FileText, Pill } from "lucide-react";

export default function NphiesSettingsPage() {
  const { t } = useTranslation();
  const { country_code } = useCountryConfig();

  // Only show tabs for KSA, otherwise just show NPHIES
  const showWasfaty = country_code === 'SA';

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nphies.settingsTitle", "KSA Compliance Settings")}
        description={t("nphies.settingsDescription", "Manage your organization's Saudi Arabia compliance integrations")}
      />
      
      {showWasfaty ? (
        <Tabs defaultValue="nphies" className="space-y-4">
          <TabsList>
            <TabsTrigger value="nphies" className="gap-2">
              <FileText className="h-4 w-4" />
              {t("nphies.title" as any, "NPHIES Insurance")}
            </TabsTrigger>
            <TabsTrigger value="wasfaty" className="gap-2">
              <Pill className="h-4 w-4" />
              {t("wasfaty.title" as any, "Wasfaty E-Prescription")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="nphies">
            <NphiesConfigPanel />
          </TabsContent>
          
          <TabsContent value="wasfaty">
            <WasfatyConfigPanel />
          </TabsContent>
        </Tabs>
      ) : (
        <NphiesConfigPanel />
      )}
    </div>
  );
}

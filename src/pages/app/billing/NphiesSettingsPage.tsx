import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { NphiesConfigPanel } from "@/components/insurance/NphiesConfigPanel";

export default function NphiesSettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nphies.settingsTitle", "NPHIES Settings")}
        description={t("nphies.settingsDescription", "Manage your organization's NPHIES integration for Saudi Arabia insurance compliance")}
      />
      <NphiesConfigPanel />
    </div>
  );
}

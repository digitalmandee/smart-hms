import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
import { Building2, Loader2 } from "lucide-react";

const SAUDI_PAYERS = [
  { name: "Bupa Arabia", code: "BUPA", cchi_payer_code: "801", nphies_payer_id: "INS-BUPA", city: "Jeddah" },
  { name: "Tawuniya", code: "TAWUNIYA", cchi_payer_code: "802", nphies_payer_id: "INS-TAWUNIYA", city: "Riyadh" },
  { name: "MedGulf", code: "MEDGULF", cchi_payer_code: "803", nphies_payer_id: "INS-MEDGULF", city: "Riyadh" },
  { name: "ACIG", code: "ACIG", cchi_payer_code: "804", nphies_payer_id: "INS-ACIG", city: "Riyadh" },
  { name: "Malath Insurance", code: "MALATH", cchi_payer_code: "805", nphies_payer_id: "INS-MALATH", city: "Riyadh" },
  { name: "Walaa Insurance", code: "WALAA", cchi_payer_code: "806", nphies_payer_id: "INS-WALAA", city: "Riyadh" },
  { name: "Al Rajhi Takaful", code: "ALRAJHI", cchi_payer_code: "807", nphies_payer_id: "INS-ALRAJHI", city: "Riyadh" },
  { name: "GlobeMed Saudi", code: "GLOBEMED", cchi_payer_code: "808", nphies_payer_id: "INS-GLOBEMED", city: "Riyadh" },
  { name: "SAICO", code: "SAICO", cchi_payer_code: "809", nphies_payer_id: "INS-SAICO", city: "Riyadh" },
  { name: "Arabian Shield", code: "ARABSHIELD", cchi_payer_code: "810", nphies_payer_id: "INS-ARABSHIELD", city: "Riyadh" },
];

export function PopulateSaudiPayersButton() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const handlePopulate = async () => {
    if (!profile?.organization_id) return;
    setIsLoading(true);

    try {
      // Fetch existing companies by CCHI code to avoid duplicates
      const { data: existing } = await supabase
        .from("insurance_companies")
        .select("cchi_payer_code")
        .eq("organization_id", profile.organization_id)
        .in("cchi_payer_code", SAUDI_PAYERS.map((p) => p.cchi_payer_code));

      const existingCodes = new Set(existing?.map((e) => e.cchi_payer_code) || []);
      const toInsert = SAUDI_PAYERS.filter((p) => !existingCodes.has(p.cchi_payer_code));

      if (toInsert.length === 0) {
        toast.info(t("nphies.allPayersExist" as any, "All Saudi payers already exist"));
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.from("insurance_companies").insert(
        toInsert.map((p) => ({
          organization_id: profile.organization_id,
          name: p.name,
          code: p.code,
          cchi_payer_code: p.cchi_payer_code,
          nphies_payer_id: p.nphies_payer_id,
          city: p.city,
          is_active: true,
        }))
      );

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["insurance-companies"] });
      const skipped = SAUDI_PAYERS.length - toInsert.length;
      toast.success(
        t("nphies.payersAdded" as any, `${toInsert.length} payers added`) +
          (skipped > 0 ? ` (${skipped} ${t("nphies.alreadyExist" as any, "already exist")})` : "")
      );
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handlePopulate} disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Building2 className="mr-2 h-4 w-4" />}
      {t("nphies.populateSaudiPayers" as any, "Populate Saudi Payers")}
    </Button>
  );
}

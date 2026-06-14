import { useTranslation } from "react-i18next";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useDrugInteractions } from "@/hooks/useDrugInteractions";

interface Props {
  medicineNames: string[];
}

const severityRank: Record<string, number> = {
  contraindicated: 4,
  major: 3,
  moderate: 2,
  minor: 1,
};

const severityVariant = (s: string): "destructive" | "default" => {
  const rank = severityRank[s?.toLowerCase()] ?? 1;
  return rank >= 3 ? "destructive" : "default";
};

export function DrugInteractionWarning({ medicineNames }: Props) {
  const { t } = useTranslation();
  const { data: interactions = [], isLoading } = useDrugInteractions(medicineNames);

  if (isLoading || interactions.length === 0) return null;

  // Show the highest-severity match first
  const sorted = [...interactions].sort(
    (a, b) =>
      (severityRank[b.severity?.toLowerCase()] ?? 0) -
      (severityRank[a.severity?.toLowerCase()] ?? 0)
  );
  const topVariant = severityVariant(sorted[0].severity);
  const Icon = topVariant === "destructive" ? ShieldAlert : AlertTriangle;

  return (
    <Alert variant={topVariant} className="mb-2">
      <Icon className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        {t("pharmacy.pos.interactionWarningTitle", "Drug interaction detected")}
        <Badge variant="outline">{sorted.length}</Badge>
      </AlertTitle>
      <AlertDescription>
        <ul className="mt-1 space-y-1 text-xs">
          {sorted.slice(0, 4).map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-2">
              <Badge
                variant={severityVariant(i.severity)}
                className="uppercase text-[10px]"
              >
                {i.severity}
              </Badge>
              <span className="font-medium">
                {i.drug_a} ↔ {i.drug_b}
              </span>
              {i.description && (
                <span className="text-muted-foreground">— {i.description}</span>
              )}
            </li>
          ))}
          {sorted.length > 4 && (
            <li className="text-muted-foreground">
              {t("pharmacy.pos.interactionMore", "and {{n}} more", {
                n: sorted.length - 4,
              })}
            </li>
          )}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Beaker, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useQuarantinedUnits, useRecordTestResults } from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";
import { format, parseISO } from "date-fns";
import { useTranslation } from "@/lib/i18n";

const SCREENING_TESTS = [
  { key: "hiv", label: "HIV" },
  { key: "hbv", label: "HBV (Hepatitis B)" },
  { key: "hcv", label: "HCV (Hepatitis C)" },
  { key: "syphilis", label: "Syphilis (VDRL)" },
  { key: "malaria", label: "Malaria" },
];

export default function BloodTestingPage() {
  const { t } = useTranslation();
  const { data: units, isLoading } = useQuarantinedUnits();
  const recordResults = useRecordTestResults();

  const [selectedUnit, setSelectedUnit] = useState<any | null>(null);
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  const openTestDialog = (unit: any) => {
    setSelectedUnit(unit);
    // Pre-fill from existing screening_result if available
    const existing = unit.donation?.screening_result;
    if (existing) {
      try {
        setTestResults(typeof existing === 'string' ? JSON.parse(existing) : existing);
      } catch {
        setTestResults({});
      }
    } else {
      setTestResults({});
    }
  };

  const allTestsFilled = SCREENING_TESTS.every((test) => testResults[test.key]);
  const allNegative = allTestsFilled && SCREENING_TESTS.every((test) => testResults[test.key] === "negative");

  const handleSubmit = async () => {
    if (!selectedUnit || !allTestsFilled) return;
    await recordResults.mutateAsync({
      unitId: selectedUnit.id,
      donationId: selectedUnit.donation_id,
      results: testResults,
      allNegative,
    });
    setSelectedUnit(null);
    setTestResults({});
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("bb.bloodTesting" as any) || "Blood Screening / Testing"}
        description={t("bb.bloodTestingDesc" as any) || "Record mandatory screening tests for quarantined blood units"}
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : units && units.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-sm font-medium">{t("bb.unitNumber" as any)}</th>
                    <th className="text-left p-3 text-sm font-medium">{t("bb.bloodGroup" as any)}</th>
                    <th className="text-left p-3 text-sm font-medium">{t("bb.donorNumber" as any)}</th>
                    <th className="text-left p-3 text-sm font-medium">{t("bb.collectionDate" as any)}</th>
                    <th className="text-left p-3 text-sm font-medium">{t("bb.testingStatus" as any) || "Testing Status"}</th>
                    <th className="text-left p-3 text-sm font-medium">{t("common.actions" as any)}</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit: any) => (
                    <tr key={unit.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-mono text-sm">{unit.unit_number}</td>
                      <td className="p-3"><BloodGroupBadge group={unit.blood_group} size="sm" /></td>
                      <td className="p-3 text-sm">
                        {unit.donation?.donor?.donor_number || '-'}
                        {unit.donation?.donor && (
                          <span className="text-muted-foreground ml-1">
                            ({unit.donation.donor.first_name} {unit.donation.donor.last_name})
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {format(parseISO(unit.collection_date), "MMM d, yyyy")}
                      </td>
                      <td className="p-3">
                        <Badge className="bg-yellow-100 text-yellow-700">
                          {unit.donation?.testing_status || "Pending"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Button size="sm" onClick={() => openTestDialog(unit)}>
                          <Beaker className="h-3.5 w-3.5 mr-1" />
                          Record Tests
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">{t("bb.noQuarantinedUnits" as any) || "No Quarantined Units"}</h3>
          <p className="text-muted-foreground">
            All blood units have been tested and processed.
          </p>
        </div>
      )}

      {/* Test Recording Dialog */}
      <Dialog open={!!selectedUnit} onOpenChange={() => setSelectedUnit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("bb.recordScreeningResults" as any) || "Record Screening Results"}</DialogTitle>
            <DialogDescription>
              Unit: {selectedUnit?.unit_number} • {selectedUnit?.blood_group}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {SCREENING_TESTS.map((test) => (
              <div key={test.key} className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium min-w-[140px]">{test.label}</Label>
                <Select
                  value={testResults[test.key] || ""}
                  onValueChange={(v) => setTestResults((prev) => ({ ...prev, [test.key]: v }))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="negative">
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" /> Negative
                      </span>
                    </SelectItem>
                    <SelectItem value="positive">
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle className="h-3 w-3" /> Positive
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}

            {allTestsFilled && (
              <div className={`p-3 rounded-lg border ${allNegative ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                {allNegative ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">All tests negative — unit will be marked Available</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Reactive result — unit will be Discarded</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUnit(null)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!allTestsFilled || recordResults.isPending}
            >
              {recordResults.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                "Submit Results"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

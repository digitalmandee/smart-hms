import { useState, useRef, useCallback } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, Download, Tag } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import {
  useBloodInventory,
  type BloodGroupType,
  type BloodUnitStatus,
  type BloodComponentType,
} from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";
import { BloodBagLabel } from "@/components/blood-bank/BloodBagLabel";
import { ListFilterBar } from "@/components/inventory/ListFilterBar";
import { useTranslation } from "@/lib/i18n";

const bloodGroups: BloodGroupType[] = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const componentTypes: { value: BloodComponentType; label: string }[] = [
  { value: "whole_blood", label: "Whole Blood" },
  { value: "packed_rbc", label: "Packed RBC" },
  { value: "fresh_frozen_plasma", label: "FFP" },
  { value: "platelet_concentrate", label: "Platelet Conc." },
  { value: "cryoprecipitate", label: "Cryoprecipitate" },
  { value: "granulocytes", label: "Granulocytes" },
];

export default function BloodBagLabelsPage() {
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState<BloodGroupType | "all">("all");
  const [componentFilter, setComponentFilter] = useState<BloodComponentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<BloodUnitStatus | "all">("available");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: inventory, isLoading } = useBloodInventory({
    status: statusFilter === "all" ? undefined : statusFilter,
    bloodGroup: bloodGroupFilter === "all" ? undefined : bloodGroupFilter,
    componentType: componentFilter === "all" ? undefined : componentFilter,
    search: search || undefined,
  });

  const selectedUnits = (inventory || []).filter((u) => selectedIds.has(u.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (!inventory) return;
    if (selectedIds.size === inventory.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(inventory.map((u) => u.id)));
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Blood Bag Labels",
  });

  const handleDownloadPdf = useCallback(async () => {
    if (!printRef.current) return;
    try {
      const dataUrl = await toPng(printRef.current, { backgroundColor: "#ffffff" });
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 40;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, "PNG", 20, 20, pdfWidth, pdfHeight);
      pdf.save("blood-bag-labels.pdf");
    } catch {
      console.error("Failed to generate PDF");
    }
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("bb.bagLabels")}
        description={t("bb.selectUnits")}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={selectedUnits.length === 0}
              onClick={() => handlePrint()}
            >
              <Printer className="h-4 w-4 mr-2" />
              {t("common.print")}
            </Button>
            <Button
              disabled={selectedUnits.length === 0}
              onClick={handleDownloadPdf}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
        {/* Left: Unit Selection */}
        <div className="space-y-4">
          <ListFilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={t("bb.searchUnits")}
          >
            <Select value={bloodGroupFilter} onValueChange={(v) => setBloodGroupFilter(v as any)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={t("bb.bloodGroup")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {bloodGroups.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={componentFilter} onValueChange={(v) => setComponentFilter(v as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("bb.componentType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {componentTypes.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("common.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="quarantine">Quarantine</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
          </ListFilterBar>

          {isLoading ? (
            <div className="space-y-2">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : inventory && inventory.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 w-10">
                        <Checkbox
                          checked={selectedIds.size === inventory.length && inventory.length > 0}
                          onCheckedChange={selectAll}
                        />
                      </th>
                      <th className="text-left p-2">{t("bb.unitNumber")}</th>
                      <th className="text-left p-2">{t("bb.bloodGroup")}</th>
                      <th className="text-left p-2">{t("bb.componentType")}</th>
                      <th className="text-left p-2">{t("bb.volume")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((unit) => (
                      <tr
                        key={unit.id}
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleSelect(unit.id)}
                      >
                        <td className="p-2">
                          <Checkbox checked={selectedIds.has(unit.id)} />
                        </td>
                        <td className="p-2 font-mono">{unit.unit_number}</td>
                        <td className="p-2">
                          <BloodGroupBadge group={unit.blood_group} size="sm" />
                        </td>
                        <td className="p-2">
                          {componentTypes.find((c) => c.value === unit.component_type)?.label || unit.component_type}
                        </td>
                        <td className="p-2">{unit.volume_ml} ml</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-10 w-10 mx-auto mb-2" />
              <p>No units found. Adjust filters.</p>
            </div>
          )}
        </div>

        {/* Right: Label Preview */}
        <div className="min-w-[320px]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                {t("bb.labelPreview")} ({selectedUnits.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedUnits.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {t("bb.selectUnits")}
                </p>
              ) : (
                <div
                  ref={printRef}
                  className="space-y-4 print:grid print:grid-cols-2 print:gap-3 print:space-y-0"
                >
                  {selectedUnits.map((unit) => (
                    <BloodBagLabel key={unit.id} unit={unit} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

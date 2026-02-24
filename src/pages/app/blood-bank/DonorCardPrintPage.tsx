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
import { Printer, Download, CreditCard, Image } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import {
  useBloodDonors,
  type BloodGroupType,
  type DonorStatus,
} from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";
import { PrintableDonorCard } from "@/components/blood-bank/PrintableDonorCard";
import { ListFilterBar } from "@/components/inventory/ListFilterBar";
import { useTranslation } from "@/lib/i18n";

const bloodGroups: BloodGroupType[] = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

export default function DonorCardPrintPage() {
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState<BloodGroupType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<DonorStatus | "all">("active");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: donors, isLoading } = useBloodDonors({
    status: statusFilter === "all" ? undefined : statusFilter,
    bloodGroup: bloodGroupFilter === "all" ? undefined : bloodGroupFilter,
    search: search || undefined,
  });

  const selectedDonors = (donors || []).filter((d) => selectedIds.has(d.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (!donors) return;
    if (selectedIds.size === donors.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(donors.map((d) => d.id)));
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Donor ID Cards",
  });

  const handleDownloadPng = useCallback(async () => {
    if (!printRef.current) return;
    try {
      const dataUrl = await toPng(printRef.current, { backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = "donor-cards.png";
      link.href = dataUrl;
      link.click();
    } catch {
      console.error("Failed to generate PNG");
    }
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    if (!printRef.current) return;
    try {
      const dataUrl = await toPng(printRef.current, { backgroundColor: "#ffffff" });
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 40;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, "PNG", 20, 20, pdfWidth, pdfHeight);
      pdf.save("donor-cards.pdf");
    } catch {
      console.error("Failed to generate PDF");
    }
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("bb.donorCard")}
        description={t("bb.selectDonors")}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={selectedDonors.length === 0}
              onClick={handleDownloadPng}
            >
              <Image className="h-4 w-4 mr-2" />
              PNG
            </Button>
            <Button
              variant="outline"
              disabled={selectedDonors.length === 0}
              onClick={() => handlePrint()}
            >
              <Printer className="h-4 w-4 mr-2" />
              {t("common.print")}
            </Button>
            <Button
              disabled={selectedDonors.length === 0}
              onClick={handleDownloadPdf}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
        {/* Left: Donor Selection */}
        <div className="space-y-4">
          <ListFilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={t("bb.searchDonors") || "Search donors..."}
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
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("common.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deferred">Deferred</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </ListFilterBar>

          {isLoading ? (
            <div className="space-y-2">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : donors && donors.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 w-10">
                        <Checkbox
                          checked={selectedIds.size === donors.length && donors.length > 0}
                          onCheckedChange={selectAll}
                        />
                      </th>
                      <th className="text-left p-2">{t("bb.donorNumber")}</th>
                      <th className="text-left p-2">{t("common.name")}</th>
                      <th className="text-left p-2">{t("bb.bloodGroup")}</th>
                      <th className="text-left p-2">{t("common.phone")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donors.map((donor) => (
                      <tr
                        key={donor.id}
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleSelect(donor.id)}
                      >
                        <td className="p-2">
                          <Checkbox checked={selectedIds.has(donor.id)} />
                        </td>
                        <td className="p-2 font-mono">{donor.donor_number}</td>
                        <td className="p-2">
                          {[donor.first_name, donor.last_name].filter(Boolean).join(" ")}
                        </td>
                        <td className="p-2">
                          <BloodGroupBadge group={donor.blood_group} size="sm" />
                        </td>
                        <td className="p-2">{donor.phone || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-2" />
              <p>{t("bb.selectDonors")}</p>
            </div>
          )}
        </div>

        {/* Right: Card Preview */}
        <div className="min-w-[340px]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                {t("bb.cardPreview")} ({selectedDonors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDonors.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {t("bb.selectDonors")}
                </p>
              ) : (
                <div
                  ref={printRef}
                  className="space-y-6 print:space-y-4"
                >
                  {selectedDonors.map((donor) => (
                    <PrintableDonorCard key={donor.id} donor={donor} />
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

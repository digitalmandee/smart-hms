import React, { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/DataTable";
import { ReportSummaryCard } from "@/components/reports/ReportSummaryCard";
import { useDoctorEarnings, useMarkEarningsAsPaid, useUpdateDoctorEarning } from "@/hooks/useDoctorCompensation";
import { useTranslation } from "@/lib/i18n";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { DollarSign, CheckCircle, Clock, TrendingUp, Pencil, Check, Download } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

const SOURCE_TYPES = [
  "consultation", "procedure", "surgery", "lab_referral",
  "radiology_referral", "pharmacy_referral", "ipd_visit", "other"
];

export default function CommissionsPage() {
  const { t } = useTranslation();
  const { formatCurrency: fc } = useCurrencyFormatter();

  // Filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filters = useMemo(() => ({
    startDate,
    endDate,
    ...(sourceFilter !== "all" ? { sourceType: sourceFilter } : {}),
    ...(statusFilter !== "all" ? { isPaid: statusFilter === "paid" } : {}),
  }), [startDate, endDate, sourceFilter, statusFilter]);

  const { data: earnings = [], isLoading } = useDoctorEarnings(filters);
  const markPaid = useMarkEarningsAsPaid();
  const updateEarning = useUpdateDoctorEarning();

  // Edit dialog
  const [editItem, setEditItem] = useState<any>(null);
  const [editForm, setEditForm] = useState({ gross_amount: 0, doctor_share_percent: 0, source_type: "", notes: "" });

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const openEdit = (row: any) => {
    setEditItem(row);
    setEditForm({
      gross_amount: Number(row.gross_amount),
      doctor_share_percent: Number(row.doctor_share_percent),
      source_type: row.source_type,
      notes: row.notes || "",
    });
  };

  const saveEdit = () => {
    if (!editItem) return;
    const doctorShare = (editForm.gross_amount * editForm.doctor_share_percent) / 100;
    updateEarning.mutate({
      id: editItem.id,
      gross_amount: editForm.gross_amount,
      doctor_share_percent: editForm.doctor_share_percent,
      doctor_share_amount: doctorShare,
      hospital_share_amount: editForm.gross_amount - doctorShare,
      source_type: editForm.source_type,
      notes: editForm.notes,
    }, { onSuccess: () => setEditItem(null) });
  };

  const handleBulkPaid = () => {
    if (selected.size === 0) return;
    markPaid.mutate(Array.from(selected), { onSuccess: () => setSelected(new Set()) });
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Summary
  const summary = useMemo(() => {
    const total = earnings.reduce((s, e) => s + Number(e.doctor_share_amount), 0);
    const paid = earnings.filter(e => e.is_paid).reduce((s, e) => s + Number(e.doctor_share_amount), 0);
    return { total, paid, unpaid: total - paid, count: earnings.length };
  }, [earnings]);

  const exportCSV = () => {
    const headers = ["Date", "Doctor ID", "Source", "Gross", "Share %", "Doctor Share", "Hospital Share", "Status"];
    const rows = earnings.map(e => [
      e.earning_date, e.doctor_id, e.source_type, e.gross_amount,
      e.doctor_share_percent, e.doctor_share_amount, e.hospital_share_amount,
      e.is_paid ? "Paid" : "Unpaid"
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commissions_${startDate}_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: () => null,
      cell: ({ row }) => !row.original.is_paid ? (
        <Checkbox
          checked={selected.has(row.original.id)}
          onCheckedChange={() => toggleSelect(row.original.id)}
        />
      ) : null,
      size: 40,
    },
    {
      accessorKey: "earning_date",
      header: t("common.date"),
      cell: ({ getValue }) => format(new Date(getValue() as string), "dd MMM yyyy"),
    },
    {
      accessorKey: "doctor_id",
      header: t("hr.doctor"),
      cell: ({ getValue }) => (getValue() as string).slice(0, 8) + "…",
    },
    {
      accessorKey: "source_type",
      header: t("common.type"),
      cell: ({ getValue }) => (
        <Badge variant="outline" className="capitalize">
          {(getValue() as string).replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "source_reference",
      header: t("common.reference"),
      cell: ({ getValue }) => getValue() || "—",
    },
    {
      accessorKey: "gross_amount",
      header: t("hr.grossAmount"),
      cell: ({ getValue }) => fc(Number(getValue())),
    },
    {
      accessorKey: "doctor_share_percent",
      header: t("hr.sharePercent"),
      cell: ({ getValue }) => `${getValue()}%`,
    },
    {
      accessorKey: "doctor_share_amount",
      header: t("hr.doctorShare"),
      cell: ({ getValue }) => fc(Number(getValue())),
    },
    {
      accessorKey: "hospital_share_amount",
      header: t("hr.hospitalShare"),
      cell: ({ getValue }) => fc(Number(getValue())),
    },
    {
      accessorKey: "is_paid",
      header: t("common.status"),
      cell: ({ getValue }) => getValue() ? (
        <Badge className="bg-green-100 text-green-800">{t("common.paid")}</Badge>
      ) : (
        <Badge variant="secondary">{t("common.unpaid")}</Badge>
      ),
    },
    {
      id: "actions",
      header: t("common.actions"),
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => openEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          {!row.original.is_paid && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => markPaid.mutate([row.original.id])}
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("hr.commissions")}</h1>
          <div className="flex gap-2">
            {selected.size > 0 && (
              <Button onClick={handleBulkPaid} variant="default" size="sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                {t("hr.markPaid")} ({selected.size})
              </Button>
            )}
            <Button onClick={exportCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              {t("common.export")}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ReportSummaryCard title={t("hr.totalCommissions")} value={fc(summary.total)} icon={DollarSign} variant="default" />
          <ReportSummaryCard title={t("common.paid")} value={fc(summary.paid)} icon={CheckCircle} variant="success" />
          <ReportSummaryCard title={t("common.unpaid")} value={fc(summary.unpaid)} icon={Clock} variant="warning" />
          <ReportSummaryCard title={t("common.total")} value={summary.count} icon={TrendingUp} subtitle={t("hr.records")} />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <Label className="text-xs">{t("hr.from")}</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-40" />
              </div>
              <div>
                <Label className="text-xs">{t("hr.to")}</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-40" />
              </div>
              <div>
                <Label className="text-xs">{t("common.type")}</Label>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.all")}</SelectItem>
                    {SOURCE_TYPES.map(s => (
                      <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t("common.status")}</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.all")}</SelectItem>
                    <SelectItem value="paid">{t("common.paid")}</SelectItem>
                    <SelectItem value="unpaid">{t("common.unpaid")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <DataTable columns={columns} data={earnings} isLoading={isLoading} searchKey="source_reference" />

        {/* Edit Dialog */}
        <Dialog open={!!editItem} onOpenChange={open => !open && setEditItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("hr.editCommission")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("hr.grossAmount")}</Label>
                  <Input
                    type="number"
                    value={editForm.gross_amount}
                    onChange={e => setEditForm(f => ({ ...f, gross_amount: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>{t("hr.sharePercent")}</Label>
                  <Input
                    type="number"
                    value={editForm.doctor_share_percent}
                    onChange={e => setEditForm(f => ({ ...f, doctor_share_percent: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="bg-muted p-3 rounded text-sm">
                <p>{t("hr.doctorShare")}: <strong>{fc((editForm.gross_amount * editForm.doctor_share_percent) / 100)}</strong></p>
                <p>{t("hr.hospitalShare")}: <strong>{fc(editForm.gross_amount - (editForm.gross_amount * editForm.doctor_share_percent) / 100)}</strong></p>
              </div>
              <div>
                <Label>{t("common.type")}</Label>
                <Select value={editForm.source_type} onValueChange={v => setEditForm(f => ({ ...f, source_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SOURCE_TYPES.map(s => (
                      <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("common.notes")}</Label>
                <Textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditItem(null)}>{t("common.cancel")}</Button>
              <Button onClick={saveEdit} disabled={updateEarning.isPending}>{t("hr.updateCommission")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

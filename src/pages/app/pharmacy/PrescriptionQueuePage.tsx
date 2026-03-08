import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePrescriptionQueue } from "@/hooks/usePharmacy";
import { WasfatyStatusBadge } from "@/components/pharmacy/WasfatySubmitButton";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { ArrowLeft, Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { PrescriptionQueueItem } from "@/hooks/usePharmacy";
import { useTranslation } from "@/lib/i18n";

export default function PrescriptionQueuePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: queue, isLoading } = usePrescriptionQueue();

  const filteredQueue = (queue || []).filter((p) => {
    const matchesSearch = !search || p.prescription_number.toLowerCase().includes(search.toLowerCase()) ||
      p.patient?.first_name.toLowerCase().includes(search.toLowerCase()) ||
      p.patient?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.patient?.patient_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnDef<PrescriptionQueueItem>[] = [
    { accessorKey: "prescription_number", header: t('pharmacy.rxNumber' as any), cell: ({ row }) => <span className="font-mono font-medium">{row.original.prescription_number}</span> },
    { accessorKey: "patient", header: t('common.patient' as any), cell: ({ row }) => { const patient = row.original.patient; return (<div><p className="font-medium">{patient?.first_name} {patient?.last_name}</p><p className="text-xs text-muted-foreground">{patient?.patient_number}</p></div>); } },
    { accessorKey: "doctor", header: t('common.doctor' as any), cell: ({ row }) => row.original.doctor?.profile?.full_name || "-" },
    { accessorKey: "created_at", header: t('common.dateTime' as any), cell: ({ row }) => format(new Date(row.original.created_at), "MMM d, h:mm a") },
    { accessorKey: "itemCount", header: t('common.items' as any), cell: ({ row }) => `${row.original.itemCount} ${t('pharmacy.items' as any)}` },
    { accessorKey: "status", header: t('common.status' as any), cell: ({ row }) => (<Badge variant={row.original.status === "partially_dispensed" ? "secondary" : "outline"}>{row.original.status === "partially_dispensed" ? t('pharmacy.partial' as any) : t('pharmacy.pending' as any)}</Badge>) },
    { id: "actions", cell: ({ row }) => (<Button size="sm" onClick={() => navigate(`/app/pharmacy/dispense/${row.original.id}`)}>{t('pharmacy.dispense' as any)}</Button>) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pharmacy.prescriptionQueue' as any)}
        description={t('pharmacy.prescriptionsWaitingToDispense' as any)}
        actions={<Button variant="outline" onClick={() => navigate("/app/pharmacy")}><ArrowLeft className="mr-2 h-4 w-4" />{t('pharmacy.backToPharmacy' as any)}</Button>}
      />
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('pharmacy.searchByRxPatient' as any)} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('pharmacy.filterByStatus' as any)} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('pharmacy.allPending' as any)}</SelectItem>
            <SelectItem value="created">{t('pharmacy.new' as any)}</SelectItem>
            <SelectItem value="partially_dispensed">{t('pharmacy.partial' as any)}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={filteredQueue} isLoading={isLoading} onRowClick={(row) => navigate(`/app/pharmacy/dispense/${row.id}`)} />
    </div>
  );
}

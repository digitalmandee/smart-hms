import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useImagingOrders, IMAGING_STATUSES, IMAGING_MODALITIES, IMAGING_PRIORITIES } from '@/hooks/useImaging';
import { ReportTable, Column } from '@/components/reports/ReportTable';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

const priorityColors: Record<string, "destructive" | "secondary" | "outline"> = {
  stat: "destructive", urgent: "secondary", routine: "outline",
};
const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  ordered: "outline", scheduled: "secondary", in_progress: "secondary",
  completed: "default", reported: "default", verified: "default", cancelled: "destructive",
};

export default function ImagingOrdersListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: orders, isLoading } = useImagingOrders();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filtered = (orders || []).filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (modalityFilter !== 'all' && order.modality !== modalityFilter) return false;
    if (priorityFilter !== 'all' && order.priority !== priorityFilter) return false;
    return true;
  });

  const columns: Column<any>[] = [
    { key: "order_number", header: "Order #", sortable: true },
    { key: "modality", header: "Modality", sortable: true, cell: (r) => <Badge variant="secondary">{r.modality?.toUpperCase()}</Badge> },
    { key: "procedure_name", header: "Procedure", sortable: true, cell: (r) => r.procedure_name || "–" },
    { key: "clinical_indication", header: "Indication", cell: (r) => <span className="line-clamp-1 max-w-[200px]">{r.clinical_indication || "–"}</span> },
    { key: "priority", header: "Priority", sortable: true, cell: (r) => <Badge variant={priorityColors[r.priority] || "outline"}>{r.priority}</Badge> },
    { key: "status", header: "Status", sortable: true, cell: (r) => <Badge variant={statusColors[r.status] || "outline"}>{r.status}</Badge> },
    { key: "created_at", header: "Date", sortable: true, cell: (r) => r.created_at ? new Date(r.created_at).toLocaleDateString() : "–" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('radiology.imagingOrders' as any)}
        description={t('radiology.imagingOrdersDesc' as any)}
        actions={
          <Button onClick={() => navigate('/app/radiology/orders/new')}>
            <Plus className="h-4 w-4 mr-2" />{t('radiology.newOrder' as any)}
          </Button>
        }
      />
      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {IMAGING_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={modalityFilter} onValueChange={setModalityFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Modality" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modalities</SelectItem>
            {IMAGING_MODALITIES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {IMAGING_PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <ReportTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        pageSize={20}
        searchPlaceholder="Search by order number, indication..."
        emptyMessage="No orders found matching your criteria"
        onRowClick={(r) => navigate(`/app/radiology/orders/${r.id}`)}
      />
      <div className="text-sm text-muted-foreground">
        Showing {filtered.length} of {orders?.length || 0} orders
      </div>
    </div>
  );
}

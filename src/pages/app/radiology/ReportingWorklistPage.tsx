import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useImagingOrders, IMAGING_MODALITIES } from '@/hooks/useImaging';
import { ReportTable, Column } from '@/components/reports/ReportTable';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { FileText, RefreshCw, Clock, CheckCircle2 } from 'lucide-react';

const priorityColors: Record<string, "destructive" | "secondary" | "outline"> = {
  stat: "destructive", urgent: "secondary", routine: "outline",
};

export default function ReportingWorklistPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: orders, isLoading, refetch } = useImagingOrders();
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [view, setView] = useState<'pending' | 'verification' | 'completed'>('pending');

  const pendingOrders = orders?.filter(o => o.status === 'completed') || [];
  const verificationOrders = orders?.filter(o => o.status === 'reported') || [];
  const completedOrders = orders?.filter(o => o.status === 'verified' || (o.status as string) === 'delivered') || [];

  const currentOrders = view === 'pending' ? pendingOrders : view === 'verification' ? verificationOrders : completedOrders;
  const filtered = modalityFilter === 'all' ? currentOrders : currentOrders.filter(o => o.modality === modalityFilter);

  const sorted = [...filtered].sort((a, b) => {
    const po = { stat: 0, urgent: 1, routine: 2 };
    const ap = po[a.priority as keyof typeof po] ?? 2;
    const bp = po[b.priority as keyof typeof po] ?? 2;
    if (ap !== bp) return ap - bp;
    return new Date(a.performed_at || a.created_at || 0).getTime() - new Date(b.performed_at || b.created_at || 0).getTime();
  });

  const columns: Column<any>[] = [
    { key: "order_number", header: "Order #", sortable: true },
    { key: "modality", header: "Modality", sortable: true, cell: (r) => <Badge variant="secondary">{r.modality?.toUpperCase()}</Badge> },
    { key: "procedure_name", header: "Procedure", sortable: true },
    { key: "priority", header: "Priority", sortable: true, cell: (r) => <Badge variant={priorityColors[r.priority] || "outline"}>{r.priority}</Badge> },
    { key: "performed_at", header: "Performed", sortable: true, cell: (r) => r.performed_at ? format(new Date(r.performed_at), 'PP p') : "–" },
    {
      key: "action", header: t("common.actions" as any), cell: (r) => (
        <Button
          size="sm"
          variant={view === 'completed' ? 'outline' : 'default'}
          onClick={(e) => {
            e.stopPropagation();
            navigate(view === 'pending' ? `/app/radiology/report/${r.id}` : view === 'verification' ? `/app/radiology/verify/${r.id}` : `/app/radiology/report/${r.id}`);
          }}
        >
          {view === 'pending' ? 'Report' : view === 'verification' ? 'Verify' : 'View'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('radiology.reportingWorklist' as any)}
        description={t('radiology.reportingWorklistDesc' as any)}
        actions={
          <div className="flex gap-2">
            <Select value={modalityFilter} onValueChange={setModalityFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Modalities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modalities</SelectItem>
                {IMAGING_MODALITIES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetch()}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          </div>
        }
      />
      <div className="flex gap-2">
        <Button variant={view === 'pending' ? 'default' : 'outline'} onClick={() => setView('pending')}>
          <FileText className="h-4 w-4 mr-2" />Pending ({pendingOrders.length})
        </Button>
        <Button variant={view === 'verification' ? 'default' : 'outline'} onClick={() => setView('verification')}>
          <Clock className="h-4 w-4 mr-2" />Verification ({verificationOrders.length})
        </Button>
        <Button variant={view === 'completed' ? 'default' : 'outline'} onClick={() => setView('completed')}>
          <CheckCircle2 className="h-4 w-4 mr-2" />Completed ({completedOrders.length})
        </Button>
      </div>
      <ReportTable
        data={sorted}
        columns={columns}
        isLoading={isLoading}
        pageSize={20}
        searchPlaceholder="Search by order number, procedure..."
        emptyMessage={view === 'pending' ? 'No studies pending report' : view === 'verification' ? 'No reports awaiting verification' : 'No completed reports'}
      />
    </div>
  );
}

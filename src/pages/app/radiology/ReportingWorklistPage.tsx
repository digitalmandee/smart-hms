import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useImagingOrders, IMAGING_MODALITIES } from '@/hooks/useImaging';
import { ImagingOrderCard } from '@/components/radiology/ImagingOrderCard';
import { ModalityBadge } from '@/components/radiology/ModalityBadge';
import { ImagingPriorityBadge } from '@/components/radiology/ImagingPriorityBadge';
import { format } from 'date-fns';
import { FileText, RefreshCw, Clock, AlertTriangle } from 'lucide-react';

export default function ReportingWorklistPage() {
  const navigate = useNavigate();
  const { orders, isLoading, refetch } = useImagingOrders();
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [view, setView] = useState<'pending' | 'verification'>('pending');

  // Pending reports: completed studies awaiting reporting
  const pendingReportOrders = orders?.filter(o => o.status === 'completed') || [];
  
  // Awaiting verification: reported but not yet verified
  const awaitingVerificationOrders = orders?.filter(o => o.status === 'reported') || [];

  const currentOrders = view === 'pending' ? pendingReportOrders : awaitingVerificationOrders;
  
  const filteredOrders = modalityFilter === 'all' 
    ? currentOrders 
    : currentOrders.filter(o => o.modality === modalityFilter);

  // Sort by priority and age
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const priorityOrder = { stat: 0, urgent: 1, routine: 2 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(a.performed_at || a.created_at || 0).getTime() - new Date(b.performed_at || b.created_at || 0).getTime();
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporting Worklist"
        subtitle="Studies awaiting radiologist interpretation"
      >
        <div className="flex gap-2">
          <Select value={modalityFilter} onValueChange={setModalityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Modalities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modalities</SelectItem>
              {IMAGING_MODALITIES.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </PageHeader>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={view === 'pending' ? 'default' : 'outline'}
          onClick={() => setView('pending')}
        >
          <FileText className="h-4 w-4 mr-2" />
          Pending Reports ({pendingReportOrders.length})
        </Button>
        <Button
          variant={view === 'verification' ? 'default' : 'outline'}
          onClick={() => setView('verification')}
        >
          <Clock className="h-4 w-4 mr-2" />
          Awaiting Verification ({awaitingVerificationOrders.length})
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading worklist...</div>
      ) : sortedOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">
              {view === 'pending' ? 'No studies pending report' : 'No reports awaiting verification'}
            </p>
            <p className="text-muted-foreground">
              {view === 'pending' 
                ? 'Completed studies will appear here for reporting'
                : 'Reported studies will appear here for verification'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map(order => (
            <Card 
              key={order.id} 
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate(
                view === 'pending' 
                  ? `/app/radiology/report/${order.id}`
                  : `/app/radiology/verify/${order.id}`
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{order.order_number}</span>
                      <ModalityBadge modality={order.modality} />
                      <ImagingPriorityBadge priority={order.priority} showIcon />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {order.clinical_indication || 'No clinical indication'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {order.performed_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Performed: {format(new Date(order.performed_at), 'PPp')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="sm">
                    {view === 'pending' ? 'Report' : 'Verify'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

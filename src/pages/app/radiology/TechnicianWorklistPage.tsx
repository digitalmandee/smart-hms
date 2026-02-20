import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useImagingOrders, IMAGING_MODALITIES } from '@/hooks/useImaging';
import { TechnicianWorklistCard } from '@/components/radiology/TechnicianWorklistCard';
import { AlertTriangle, Radio, RefreshCw } from 'lucide-react';

export default function TechnicianWorklistPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: orders, isLoading, refetch } = useImagingOrders();
  const [modalityFilter, setModalityFilter] = useState<string>('all');

  // Filter for technician worklist: ordered, scheduled, in_progress
  const worklistOrders = orders?.filter(o => 
    ['ordered', 'scheduled', 'in_progress'].includes(o.status)
  ) || [];

  const filteredOrders = modalityFilter === 'all' 
    ? worklistOrders 
    : worklistOrders.filter(o => o.modality === modalityFilter);

  // Sort by priority (stat first) then by date
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const priorityOrder = { stat: 0, urgent: 1, routine: 2 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
  });

  const statOrders = sortedOrders.filter(o => o.priority === 'stat');
  const urgentOrders = sortedOrders.filter(o => o.priority === 'urgent');
  const routineOrders = sortedOrders.filter(o => o.priority === 'routine');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('radiology.technicianWorklist' as any)}
        description={t('radiology.technicianWorklistDesc' as any)}
        actions={
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
        }
      />

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading worklist...</div>
      ) : sortedOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Radio className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Worklist is empty</p>
            <p className="text-muted-foreground">No pending imaging studies</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* STAT Orders */}
          {statOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-600">STAT ({statOrders.length})</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statOrders.map(order => (
                  <TechnicianWorklistCard
                    key={order.id}
                    order={order}
                    onStartStudy={(o) => navigate(`/app/radiology/capture/${o.id}`)}
                    onCompleteStudy={(o) => navigate(`/app/radiology/orders/${o.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Urgent Orders */}
          {urgentOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                  Urgent ({urgentOrders.length})
                </Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {urgentOrders.map(order => (
                  <TechnicianWorklistCard
                    key={order.id}
                    order={order}
                    onStartStudy={(o) => navigate(`/app/radiology/capture/${o.id}`)}
                    onCompleteStudy={(o) => navigate(`/app/radiology/orders/${o.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Routine Orders */}
          {routineOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                  Routine ({routineOrders.length})
                </Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {routineOrders.map(order => (
                  <TechnicianWorklistCard
                    key={order.id}
                    order={order}
                    onStartStudy={(o) => navigate(`/app/radiology/capture/${o.id}`)}
                    onCompleteStudy={(o) => navigate(`/app/radiology/orders/${o.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

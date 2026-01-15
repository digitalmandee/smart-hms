import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useImagingOrders } from '@/hooks/useImaging';
import { ImagingStatusBadge } from '@/components/radiology/ImagingStatusBadge';
import { ImagingPriorityBadge } from '@/components/radiology/ImagingPriorityBadge';
import { ModalityBadge } from '@/components/radiology/ModalityBadge';
import { ImageViewer } from '@/components/radiology/ImageViewer';
import { PrintableImagingReport } from '@/components/radiology/PrintableImagingReport';
import { usePrint } from '@/hooks/usePrint';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  Printer, 
  Play, 
  CheckCircle,
  User
} from 'lucide-react';
import { toast } from 'sonner';

export default function ImagingOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrder, isUpdating } = useImagingOrders();
  const { printRef, handlePrint } = usePrint();

  const order = orders?.find(o => o.id === id);

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Order not found</p>
        <Button variant="link" onClick={() => navigate('/app/radiology/orders')}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const handleStartStudy = async () => {
    try {
      await updateOrder({ id: order.id, status: 'in_progress' });
      toast.success('Study started');
      navigate(`/app/radiology/capture/${order.id}`);
    } catch (error) {
      toast.error('Failed to start study');
    }
  };

  const handleMarkComplete = async () => {
    try {
      await updateOrder({ id: order.id, status: 'completed', performed_at: new Date().toISOString() });
      toast.success('Study marked as complete');
    } catch (error) {
      toast.error('Failed to complete study');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order: ${order.order_number || 'N/A'}`}
        subtitle="Imaging order details and report"
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {order.status === 'verified' && (
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print Report
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order Information</CardTitle>
              <div className="flex gap-2">
                <ImagingStatusBadge status={order.status} />
                <ImagingPriorityBadge priority={order.priority} showIcon />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-medium">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modality</p>
                <ModalityBadge modality={order.modality} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {order.created_at ? format(new Date(order.created_at), 'PPp') : '-'}
                </p>
              </div>
              {order.scheduled_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                  <p className="font-medium">
                    {format(new Date(order.scheduled_date), 'PPp')}
                  </p>
                </div>
              )}
              {order.performed_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Performed</p>
                  <p className="font-medium">
                    {format(new Date(order.performed_at), 'PPp')}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-1">Clinical Indication</p>
              <p>{order.clinical_indication || 'Not specified'}</p>
            </div>

            {order.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p>{order.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              {order.status === 'ordered' && (
                <Button onClick={handleStartStudy} disabled={isUpdating}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Study
                </Button>
              )}
              {order.status === 'in_progress' && (
                <>
                  <Button onClick={() => navigate(`/app/radiology/capture/${order.id}`)}>
                    Continue Capture
                  </Button>
                  <Button variant="outline" onClick={handleMarkComplete} disabled={isUpdating}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                </>
              )}
              {order.status === 'completed' && (
                <Button onClick={() => navigate(`/app/radiology/report/${order.id}`)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Patient details would be shown here when joined with patients table.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Patient ID: {order.patient_id}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Images Section */}
      {order.imaging_results?.[0]?.images && (
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageViewer 
              images={order.imaging_results[0].images as string[]} 
            />
          </CardContent>
        </Card>
      )}

      {/* Report Section */}
      {order.imaging_results?.[0] && (
        <Card>
          <CardHeader>
            <CardTitle>Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Findings</p>
              <p className="whitespace-pre-wrap">{order.imaging_results[0].findings || 'No findings recorded'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Impression</p>
              <p className="whitespace-pre-wrap">{order.imaging_results[0].impression || 'No impression recorded'}</p>
            </div>
            {order.imaging_results[0].recommendations && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Recommendations</p>
                <p className="whitespace-pre-wrap">{order.imaging_results[0].recommendations}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Printable Report */}
      <div className="hidden">
        <div ref={printRef}>
          <PrintableImagingReport order={order} />
        </div>
      </div>
    </div>
  );
}

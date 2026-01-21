import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useImagingOrder, useUpdateImagingOrder, useImagingResult } from '@/hooks/useImaging';
import { ImagingStatusBadge } from '@/components/radiology/ImagingStatusBadge';
import { ImagingPriorityBadge } from '@/components/radiology/ImagingPriorityBadge';
import { ModalityBadge } from '@/components/radiology/ModalityBadge';
import { ImageViewer } from '@/components/radiology/ImageViewer';
import { PrintableImagingReport } from '@/components/radiology/PrintableImagingReport';
import { PaymentStatusBadge } from '@/components/radiology/PaymentStatusBadge';
import { usePrint } from '@/hooks/usePrint';
import { useInvoice } from '@/hooks/useBilling';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Printer, 
  Play, 
  CheckCircle,
  FileText,
  User,
  Receipt,
  ExternalLink
} from 'lucide-react';

export default function ImagingOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useImagingOrder(id);
  const { data: result } = useImagingResult(id);
  const { data: invoice } = useInvoice(order?.invoice_id);
  const { mutate: updateOrder, isPending: isUpdating } = useUpdateImagingOrder();
  const { printRef, handlePrint } = usePrint();

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

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

  const handleStartStudy = () => {
    updateOrder({ id: order.id, status: 'in_progress' }, {
      onSuccess: () => {
        toast.success('Study started');
        navigate(`/app/radiology/capture/${order.id}`);
      }
    });
  };

  const handleMarkComplete = () => {
    updateOrder({ 
      id: order.id, 
      status: 'completed', 
      performed_at: new Date().toISOString() 
    }, {
      onSuccess: () => toast.success('Study marked as complete')
    });
  };

  const onPrint = () => {
    handlePrint({ title: `Imaging Report - ${order.order_number}` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order: ${order.order_number || 'N/A'}`}
        description="Imaging order details and report"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {order.status === 'verified' && result && (
              <Button variant="outline" onClick={onPrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print Report
              </Button>
            )}
          </div>
        }
      />

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
                <p className="text-sm text-muted-foreground">Procedure</p>
                <p className="font-medium">{order.procedure_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ordered</p>
                <p className="font-medium">
                  {order.ordered_at ? format(new Date(order.ordered_at), 'PPp') : '-'}
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
            {order.patient ? (
              <div className="space-y-2">
                <p className="font-medium">{order.patient.first_name} {order.patient.last_name}</p>
                <p className="text-sm text-muted-foreground">MRN: {order.patient.patient_number}</p>
                {order.patient.gender && <p className="text-sm text-muted-foreground capitalize">{order.patient.gender}</p>}
                {order.patient.phone && <p className="text-sm text-muted-foreground">{order.patient.phone}</p>}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Patient ID: {order.patient_id}</p>
            )}
          </CardContent>
        </Card>

        {/* Billing Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <PaymentStatusBadge status={order.payment_status || 'pending'} />
            </div>

            {order.invoice_id && invoice ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Invoice:</span>
                  <span className="font-mono">{invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">Rs. {invoice.total_amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid:</span>
                  <span className="font-medium text-primary">Rs. {(invoice.paid_amount || 0).toLocaleString()}</span>
                </div>
                {invoice.total_amount > (invoice.paid_amount || 0) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className="font-medium text-destructive">Rs. {(invoice.total_amount - (invoice.paid_amount || 0)).toLocaleString()}</span>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate(`/app/billing/invoices/${order.invoice_id}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Invoice
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">No invoice linked</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate(`/app/billing/invoices/new?patientId=${order.patient_id}`)}
                >
                  Create Invoice
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Images Section */}
      {result?.images && Array.isArray(result.images) && result.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageViewer images={result.images as string[]} />
          </CardContent>
        </Card>
      )}

      {/* Report Section */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Findings</p>
              <p className="whitespace-pre-wrap">{result.findings || 'No findings recorded'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Impression</p>
              <p className="whitespace-pre-wrap">{result.impression || 'No impression recorded'}</p>
            </div>
            {result.recommendations && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Recommendations</p>
                <p className="whitespace-pre-wrap">{result.recommendations}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Printable Report */}
      {result && (
        <div className="hidden">
          <div ref={printRef}>
            <PrintableImagingReport order={order} result={result} />
          </div>
        </div>
      )}
    </div>
  );
}

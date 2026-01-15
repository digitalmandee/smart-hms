import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useImagingOrder, useUpdateImagingOrder, useImagingResult } from '@/hooks/useImaging';
import { ModalityBadge } from '@/components/radiology/ModalityBadge';
import { ImagingPriorityBadge } from '@/components/radiology/ImagingPriorityBadge';
import { PrintableImagingReport } from '@/components/radiology/PrintableImagingReport';
import { usePrint } from '@/hooks/usePrint';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Printer,
  FileText,
  Edit
} from 'lucide-react';

export default function ReportVerificationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useImagingOrder(id);
  const { data: result } = useImagingResult(id);
  const { mutate: updateOrder, isPending: isUpdating } = useUpdateImagingOrder();
  const { printRef, handlePrint } = usePrint();

  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Order not found</p>
        <Button variant="link" onClick={() => navigate('/app/radiology/reporting')}>
          Back to Reporting Worklist
        </Button>
      </div>
    );
  }

  const handleVerify = () => {
    updateOrder({
      id: order.id,
      status: 'verified',
      verified_at: new Date().toISOString(),
    }, {
      onSuccess: () => {
        toast.success('Report verified and finalized');
        navigate('/app/radiology/reporting');
      }
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    updateOrder({
      id: order.id,
      status: 'completed', // Send back for re-reporting
      notes: `[REJECTED] ${rejectionReason}\n\n${order.notes || ''}`,
    }, {
      onSuccess: () => {
        toast.success('Report sent back for revision');
        navigate('/app/radiology/reporting');
      }
    });
  };

  const getFindingStatusBadge = (status?: string) => {
    switch (status) {
      case 'normal':
        return <Badge className="bg-green-100 text-green-800">Normal</Badge>;
      case 'abnormal':
        return <Badge className="bg-yellow-100 text-yellow-800">Abnormal</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const onPrint = () => {
    handlePrint({ title: `Imaging Report - ${order.order_number}` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Verification"
        description={`Order: ${order.order_number}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/app/radiology/reporting')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {result && (
              <Button variant="outline" onClick={onPrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Study Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <ModalityBadge modality={order.modality} />
              <ImagingPriorityBadge priority={order.priority} showIcon />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Procedure</p>
              <p className="text-sm font-medium">{order.procedure_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clinical Indication</p>
              <p className="text-sm">{order.clinical_indication || 'Not specified'}</p>
            </div>
            {order.performed_at && (
              <div>
                <p className="text-sm text-muted-foreground">Performed</p>
                <p className="text-sm">{format(new Date(order.performed_at), 'PPp')}</p>
              </div>
            )}
            {order.reported_at && (
              <div>
                <p className="text-sm text-muted-foreground">Reported</p>
                <p className="text-sm">{format(new Date(order.reported_at), 'PPp')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Content */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report for Verification
              </CardTitle>
              {result && getFindingStatusBadge(result.finding_status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {result ? (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Findings</p>
                  <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                    {result.findings || 'No findings recorded'}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Impression</p>
                  <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                    {result.impression || 'No impression recorded'}
                  </div>
                </div>

                {result.recommendations && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Recommendations</p>
                    <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                      {result.recommendations}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Verification Actions */}
                {!showRejectForm ? (
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/app/radiology/report/${order.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Report
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setShowRejectForm(true)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button onClick={handleVerify} disabled={isUpdating}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify & Finalize
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Reason for Rejection</Label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Please provide feedback for the reporting radiologist..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleReject}
                        disabled={isUpdating}
                      >
                        Send Back for Revision
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No report found for this order
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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

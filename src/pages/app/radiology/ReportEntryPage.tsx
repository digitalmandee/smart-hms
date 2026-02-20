import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation, getTranslatedString } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useImagingOrder, useUpdateImagingOrder, useSaveImagingResult, ImagingFindingStatus } from '@/hooks/useImaging';
import { ModalityBadge } from '@/components/radiology/ModalityBadge';
import { ImagingPriorityBadge } from '@/components/radiology/ImagingPriorityBadge';
import { ReportTemplateForm } from '@/components/radiology/ReportTemplateForm';
import { toast } from 'sonner';
import { ArrowLeft, Save, FileText, AlertTriangle } from 'lucide-react';

export default function ReportEntryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: order, isLoading } = useImagingOrder(id);
  const { mutate: updateOrder } = useUpdateImagingOrder();
  const { mutate: saveResult, isPending: isSaving } = useSaveImagingResult();

  const [reportData, setReportData] = useState({
    findings: '',
    impression: '',
    recommendations: '',
    technique: '',
    comparison: '',
    finding_status: 'normal' as ImagingFindingStatus,
  });

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

  const handleSaveReport = (asDraft = false) => {
    if (!reportData.findings && !asDraft) {
      toast.error('Please enter findings before saving');
      return;
    }

    saveResult({
      orderId: order.id,
      findings: reportData.findings,
      impression: reportData.impression,
      recommendations: reportData.recommendations,
      finding_status: reportData.finding_status,
    }, {
      onSuccess: () => {
        if (!asDraft) {
          updateOrder({
            id: order.id,
            status: 'reported',
            reported_at: new Date().toISOString(),
          }, {
            onSuccess: () => {
              toast.success('Report submitted for verification');
              navigate('/app/radiology/reporting');
            }
          });
        } else {
          toast.success('Draft saved');
        }
      }
    });
  };

  const handleFieldChange = (field: string, value: string) => {
    setReportData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('radiology.reportEntry' as any)}
        description={`Order: ${order.order_number}`}
        actions={
          <Button variant="outline" onClick={() => navigate('/app/radiology/reporting')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Worklist
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Info & Templates */}
        <div className="space-y-6">
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
              {order.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Report Entry Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Radiologist Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {reportData.finding_status === 'critical' && (
              <div className="flex items-center gap-2 p-2 bg-red-50 text-red-800 rounded text-sm">
                <AlertTriangle className="h-4 w-4" />
                Critical findings require immediate communication to ordering physician
              </div>
            )}

            <ReportTemplateForm
              findings={reportData.findings}
              impression={reportData.impression}
              recommendations={reportData.recommendations}
              technique={reportData.technique}
              comparison={reportData.comparison}
              findingStatus={reportData.finding_status}
              onChange={handleFieldChange}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => handleSaveReport(true)}
                disabled={isSaving}
              >
                Save Draft
              </Button>
              <Button 
                onClick={() => handleSaveReport(false)}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Submit for Verification'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

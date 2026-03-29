import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation, getTranslatedString } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useImagingOrder, useUpdateImagingOrder, useSaveImagingResult, useImagingResult, ImagingFindingStatus } from '@/hooks/useImaging';
import { ModalityBadge } from '@/components/radiology/ModalityBadge';
import { ImagingPriorityBadge } from '@/components/radiology/ImagingPriorityBadge';
import { ReportTemplateForm } from '@/components/radiology/ReportTemplateForm';
import { PrintableImagingReport } from '@/components/radiology/PrintableImagingReport';
import { usePrint } from '@/hooks/usePrint';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, Save, FileText, AlertTriangle, Printer } from 'lucide-react';
import { useOrganizationBranding } from '@/hooks/useOrganizationBranding';

export default function ReportEntryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: order, isLoading } = useImagingOrder(id);
  const { data: existingResult } = useImagingResult(id);
  const { mutate: updateOrder } = useUpdateImagingOrder();
  const { mutate: saveResult, isPending: isSaving } = useSaveImagingResult();
  const { printRef, handlePrint } = usePrint();

  const [reportData, setReportData] = useState({
    findings: '',
    impression: '',
    recommendations: '',
    technique: '',
    comparison: '',
    finding_status: 'normal' as ImagingFindingStatus,
  });

  // Pre-populate form from existing result
  useEffect(() => {
    if (existingResult) {
      setReportData({
        findings: existingResult.findings || '',
        impression: existingResult.impression || '',
        recommendations: existingResult.recommendations || '',
        technique: existingResult.technique || '',
        comparison: existingResult.comparison || '',
        finding_status: (existingResult.finding_status as ImagingFindingStatus) || 'normal',
      });
    }
  }, [existingResult]);

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

  const isFinalized = ['reported', 'verified', 'delivered'].includes(order.status);

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

  // ─── Read-only view for finalized reports ─────────────────────
  if (isFinalized && existingResult) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('radiology.finalizedReport' as any)}
          description={`${t('radiology.orderNumber' as any)}: ${order.order_number}`}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/app/radiology/reporting')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('radiology.backToWorklist' as any)}
              </Button>
              <Button variant="outline" onClick={onPrint}>
                <Printer className="h-4 w-4 mr-2" />
                {t('radiology.printReport' as any)}
              </Button>
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Study Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('radiology.studyInfo' as any)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <ModalityBadge modality={order.modality} />
                <ImagingPriorityBadge priority={order.priority} showIcon />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('radiology.procedure' as any)}</p>
                <p className="text-sm font-medium">{order.procedure_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('radiology.clinicalIndication' as any)}</p>
                <p className="text-sm">{order.clinical_indication || t('radiology.notSpecified' as any)}</p>
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
              {order.verified_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Verified</p>
                  <p className="text-sm">{format(new Date(order.verified_at), 'PPp')}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="bg-green-100 text-green-800 capitalize">{order.status}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Report Content - Read Only */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('radiology.finalizedReport' as any)}
                </CardTitle>
                {getFindingStatusBadge(existingResult.finding_status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {existingResult.technique && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Technique</p>
                  <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                    {existingResult.technique}
                  </div>
                </div>
              )}

              {existingResult.comparison && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Comparison</p>
                  <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                    {existingResult.comparison}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Findings</p>
                <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                  {existingResult.findings || 'No findings recorded'}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Impression</p>
                <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap font-semibold">
                  {existingResult.impression || 'No impression recorded'}
                </div>
              </div>

              {existingResult.recommendations && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Recommendations</p>
                  <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                    {existingResult.recommendations}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Hidden Printable Report */}
        <div className="hidden">
          <div ref={printRef}>
            <PrintableImagingReport order={order} result={existingResult} />
          </div>
        </div>
      </div>
    );
  }

  // ─── Editable form for non-finalized reports ──────────────────
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

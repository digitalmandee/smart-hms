import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useImagingOrders, ImagingFindingStatus } from '@/hooks/useImaging';
import { ModalityBadge } from '@/components/radiology/ModalityBadge';
import { ImagingPriorityBadge } from '@/components/radiology/ImagingPriorityBadge';
import { ImageViewer } from '@/components/radiology/ImageViewer';
import { ReportTemplateForm } from '@/components/radiology/ReportTemplateForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Save, FileText, AlertTriangle } from 'lucide-react';

const FINDING_STATUSES: { value: ImagingFindingStatus; label: string; color: string }[] = [
  { value: 'normal', label: 'Normal', color: 'bg-green-100 text-green-800' },
  { value: 'abnormal', label: 'Abnormal', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
];

export default function ReportEntryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrder, refetch } = useImagingOrders();

  const order = orders?.find(o => o.id === id);

  const [reportData, setReportData] = useState({
    findings: '',
    impression: '',
    recommendations: '',
    finding_status: 'normal' as ImagingFindingStatus,
  });
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSaveReport = async (asDraft = false) => {
    if (!reportData.findings && !asDraft) {
      toast.error('Please enter findings before saving');
      return;
    }

    setIsSaving(true);
    try {
      // Create or update imaging result
      const { error: resultError } = await supabase
        .from('imaging_results')
        .upsert({
          order_id: order.id,
          findings: reportData.findings,
          impression: reportData.impression,
          recommendations: reportData.recommendations,
          finding_status: reportData.finding_status,
        }, {
          onConflict: 'order_id',
        });

      if (resultError) throw resultError;

      // Update order status
      if (!asDraft) {
        await updateOrder({
          id: order.id,
          status: 'reported',
          reported_at: new Date().toISOString(),
        });
      }

      await refetch();
      toast.success(asDraft ? 'Draft saved' : 'Report submitted for verification');
      
      if (!asDraft) {
        navigate('/app/radiology/reporting');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTemplateApply = (templateData: { findings: string; impression: string }) => {
    setReportData(prev => ({
      ...prev,
      findings: templateData.findings,
      impression: templateData.impression,
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Entry"
        subtitle={`Order: ${order.order_number}`}
      >
        <Button variant="outline" onClick={() => navigate('/app/radiology/reporting')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Worklist
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Info & Images */}
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

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportTemplateForm 
                modality={order.modality}
                onApply={handleTemplateApply}
              />
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
            {/* Finding Status */}
            <div className="space-y-2">
              <Label>Finding Status</Label>
              <Select 
                value={reportData.finding_status}
                onValueChange={(value) => setReportData(prev => ({ 
                  ...prev, 
                  finding_status: value as ImagingFindingStatus 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FINDING_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      <span className={`px-2 py-0.5 rounded text-xs ${status.color}`}>
                        {status.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {reportData.finding_status === 'critical' && (
                <div className="flex items-center gap-2 p-2 bg-red-50 text-red-800 rounded text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Critical findings require immediate communication to ordering physician
                </div>
              )}
            </div>

            {/* Findings */}
            <div className="space-y-2">
              <Label htmlFor="findings">Findings *</Label>
              <Textarea
                id="findings"
                value={reportData.findings}
                onChange={(e) => setReportData(prev => ({ ...prev, findings: e.target.value }))}
                placeholder="Describe the radiological findings in detail..."
                rows={8}
              />
            </div>

            {/* Impression */}
            <div className="space-y-2">
              <Label htmlFor="impression">Impression / Conclusion</Label>
              <Textarea
                id="impression"
                value={reportData.impression}
                onChange={(e) => setReportData(prev => ({ ...prev, impression: e.target.value }))}
                placeholder="Summary impression and diagnosis..."
                rows={4}
              />
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <Label htmlFor="recommendations">Recommendations</Label>
              <Textarea
                id="recommendations"
                value={reportData.recommendations}
                onChange={(e) => setReportData(prev => ({ ...prev, recommendations: e.target.value }))}
                placeholder="Recommended follow-up imaging, clinical correlation, etc."
                rows={3}
              />
            </div>

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

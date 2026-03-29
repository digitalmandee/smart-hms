import { useRef } from 'react';
import { format, differenceInYears } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useImagingOrder, useImagingResult } from '@/hooks/useImaging';
import { ImageViewer } from './ImageViewer';
import { PrintableImagingReport } from './PrintableImagingReport';
import { printElement } from '@/lib/exportUtils';
import { getImageUrls } from '@/lib/radiology-image-utils';
import { useOrganizationBranding } from '@/hooks/useOrganizationBranding';
import { 
  Printer, 
  Download, 
  User, 
  Calendar,
  Scan,
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface ImagingDetailDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<string, string> = {
  ordered: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  reported: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  verified: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const modalityLabels: Record<string, string> = {
  xray: 'X-Ray',
  ultrasound: 'Ultrasound',
  ct_scan: 'CT Scan',
  mri: 'MRI',
  ecg: 'ECG',
  echo: 'Echo',
  mammography: 'Mammography',
  fluoroscopy: 'Fluoroscopy',
  dexa: 'DEXA',
  pet_ct: 'PET-CT',
};

const findingStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  normal: { label: 'Normal', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  abnormal: { label: 'Abnormal', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  inconclusive: { label: 'Inconclusive', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
};

export function ImagingDetailDialog({ orderId, open, onOpenChange }: ImagingDetailDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { data: order, isLoading: orderLoading } = useImagingOrder(orderId || undefined);
  const { data: result, isLoading: resultLoading } = useImagingResult(orderId || undefined);
  const { data: branding } = useOrganizationBranding();

  const isLoading = orderLoading || resultLoading;

  const handlePrint = () => {
    if (printRef.current) {
      printElement(printRef.current, `Radiology Report - ${order?.order_number}`);
    }
  };

  const handleDownloadImages = () => {
    const imageUrls = getImageUrls(result?.images);
    if (imageUrls.length === 0) return;
    
    imageUrls.forEach((url: string, index: number) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${order?.order_number}-image-${index + 1}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const patientAge = order?.patient?.date_of_birth 
    ? differenceInYears(new Date(), new Date(order.patient.date_of_birth))
    : null;

  const findingConfig = result?.finding_status 
    ? findingStatusConfig[result.finding_status]
    : null;

  const images = (result?.images || []) as string[];
  const resultAny = result as any;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Scan className="h-5 w-5" />
                {order?.order_number || 'Imaging Report'}
              </DialogTitle>
              {order && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={statusColors[order.status] || 'bg-muted'}>
                    {order.status?.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline">
                    {modalityLabels[order.modality] || order.modality}
                  </Badge>
                  {findingConfig && (
                    <Badge className={findingConfig.color}>
                      <findingConfig.icon className="h-3 w-3 mr-1" />
                      {findingConfig.label}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {images.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleDownloadImages}>
                  <Download className="h-4 w-4 mr-2" />
                  Images
                </Button>
              )}
              {result && (
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-6 pt-4 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : !order ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Report not found</p>
              </div>
            ) : (
              <>
                {/* Patient & Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Patient Information
                    </div>
                    <p className="font-medium">
                      {order.patient?.first_name} {order.patient?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      MRN: {order.patient?.patient_number}
                      {patientAge !== null && ` • ${patientAge} years`}
                      {order.patient?.gender && ` • ${order.patient.gender}`}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Study Information
                    </div>
                    <p className="font-medium">
                      {order.procedure?.name || order.procedure_name || 'General Imaging'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.created_at), 'MMM dd, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>

                {/* Clinical Indication */}
                {order.clinical_indication && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Clinical Indication</h4>
                    <p className="text-sm">{order.clinical_indication}</p>
                  </div>
                )}

                <Separator />

                {/* Images */}
                {images.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Study Images</h4>
                    <ImageViewer images={images} className="max-h-[300px]" />
                  </div>
                )}

                {/* Report Content */}
                {result ? (
                  <div className="space-y-4">
                    {result.technique && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Technique</h4>
                        <p className="text-sm whitespace-pre-wrap">{result.technique}</p>
                      </div>
                    )}

                    {result.findings && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Findings</h4>
                        <p className="text-sm whitespace-pre-wrap">{result.findings}</p>
                      </div>
                    )}

                    {result.impression && (
                      <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                        <h4 className="font-medium mb-2">Impression</h4>
                        <p className="text-sm whitespace-pre-wrap">{result.impression}</p>
                      </div>
                    )}

                    {result.recommendations && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Recommendations</h4>
                        <p className="text-sm whitespace-pre-wrap">{result.recommendations}</p>
                      </div>
                    )}

                    <Separator />

                    {/* Radiologist Info */}
                    <div className="text-sm text-muted-foreground">
                      {resultAny.radiologist_profile && (
                        <p>
                          Reported by: Dr. {resultAny.radiologist_profile.first_name} {resultAny.radiologist_profile.last_name}
                          {result.created_at && ` on ${format(new Date(result.created_at), 'MMM dd, yyyy')}`}
                        </p>
                      )}
                      {resultAny.verified_by_profile && (
                        <p>
                          Verified by: Dr. {resultAny.verified_by_profile.first_name} {resultAny.verified_by_profile.last_name}
                          {resultAny.verified_at && ` on ${format(new Date(resultAny.verified_at), 'MMM dd, yyyy')}`}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No report available yet</p>
                    <p className="text-sm text-muted-foreground">
                      Report will be available once the radiologist completes the reading
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Hidden printable report */}
        {order && result && (
          <div className="hidden">
            <PrintableImagingReport
              ref={printRef}
              order={order}
              result={result}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

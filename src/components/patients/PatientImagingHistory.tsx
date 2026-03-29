import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePatientImagingHistory, useImagingOrder, useImagingResult } from "@/hooks/useImaging";
import { PrintableImagingReport } from "@/components/radiology/PrintableImagingReport";
import { format } from "date-fns";
import { Scan, Calendar, ChevronDown, ChevronUp, FileCheck2, Eye, Download, Printer, FileText, ExternalLink } from "lucide-react";
import { ImageViewer } from "@/components/radiology/ImageViewer";
import { ImagingDetailDialog } from "@/components/radiology/ImagingDetailDialog";
import { useReactToPrint } from "react-to-print";

interface PatientImagingHistoryProps {
  patientId: string;
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

const modalityIcons: Record<string, string> = {
  'xray': '🩻',
  'ultrasound': '📡',
  'ct_scan': '🔬',
  'mri': '🧲',
  'ecg': '💓',
  'echo': '❤️',
  'mammography': '🩻',
  'fluoroscopy': '🎥',
  'dexa': '🦴',
  'pet_ct': '☢️',
};

export function PatientImagingHistory({ patientId }: PatientImagingHistoryProps) {
  const navigate = useNavigate();
  const { data: imagingOrders, isLoading } = usePatientImagingHistory(patientId);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [printOrderId, setPrintOrderId] = useState<string | null>(null);

  // Fetch full order + result for printing
  const { data: printOrder } = useImagingOrder(printOrderId || undefined);
  const { data: printResult } = useImagingResult(printOrderId || undefined);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrintReport = useReactToPrint({
    contentRef: printRef,
    documentTitle: printOrder ? `Imaging Report - ${printOrder.order_number}` : 'Imaging Report',
  });

  // Trigger print when data is ready
  useEffect(() => {
    if (printOrderId && printOrder && printResult && printRef.current) {
      setTimeout(() => {
        handlePrintReport();
        setPrintOrderId(null);
      }, 500);
    }
  }, [printOrderId, printOrder, printResult, handlePrintReport]);

  const toggleExpanded = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleDownloadImages = (order: any) => {
    const images = order.result?.images || [];
    if (images.length === 0) return;
    
    images.forEach((url: string, index: number) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${order.order_number}-image-${index + 1}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Imaging History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!imagingOrders || imagingOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Imaging History</CardTitle>
          <CardDescription>Radiology and imaging test records</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Scan className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No imaging orders yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Imaging History</CardTitle>
          <CardDescription>{imagingOrders.length} imaging order(s) on record</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {imagingOrders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);
            const result = order.result as any;
            const images = (result?.images || []) as string[];
            const hasResult = result && (result.findings || result.impression);

            return (
              <Collapsible key={order.id} open={isExpanded} onOpenChange={() => toggleExpanded(order.id)}>
                <div className="border rounded-lg overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-start justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                          {modalityIcons[order.modality] || <Scan className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{order.order_number}</p>
                            <Badge className={statusColors[order.status] || 'bg-muted'}>
                              {order.status?.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(order.created_at), "MMM dd, yyyy")}
                          </div>
                          <p className="text-sm">
                            <span className="font-medium capitalize">{order.modality?.replace('_', ' ')}:</span>{' '}
                            {order.procedure?.name || 'General imaging'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {(order.priority === 'urgent' || order.priority === 'stat') && (
                              <Badge variant="destructive" className="text-xs">
                                {order.priority.toUpperCase()}
                              </Badge>
                            )}
                            {order.status === 'verified' && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <FileCheck2 className="h-3 w-3" />
                                Report Ready
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-0 border-t bg-muted/30">
                      <div className="space-y-4 pt-4">
                        {/* Clinical Indication */}
                        {order.clinical_indication && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Clinical Indication</p>
                            <p className="text-sm">{order.clinical_indication}</p>
                          </div>
                        )}

                        {/* Images */}
                        {images.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Images ({images.length})</p>
                            <ImageViewer images={images} className="max-h-[200px]" />
                          </div>
                        )}

                        {/* Report Summary */}
                        {hasResult && (
                          <div className="space-y-3">
                            {result.impression && (
                              <div className="p-3 bg-primary/5 rounded-lg border-l-4 border-primary">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Impression</p>
                                <p className="text-sm line-clamp-3">{result.impression}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {!hasResult && order.status !== 'verified' && order.status !== 'reported' && (
                          <div className="text-center py-4">
                            <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Report pending</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedOrderId(order.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {(order.status === 'verified' || order.status === 'reported') && hasResult && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPrintOrderId(order.id);
                                }}
                              >
                                <Printer className="h-4 w-4 mr-2" />
                                Print Report
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/app/radiology/report/${order.id}`);
                                }}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Report
                              </Button>
                            </>
                          )}
                          {images.length > 0 && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadImages(order)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Images
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </CardContent>
      </Card>

      <ImagingDetailDialog
        orderId={selectedOrderId}
        open={!!selectedOrderId}
        onOpenChange={(open) => !open && setSelectedOrderId(null)}
      />

      {/* Hidden printable report */}
      {printOrderId && printOrder && printResult && (
        <div className="hidden">
          <div ref={printRef}>
            <PrintableImagingReport order={printOrder} result={printResult} />
          </div>
        </div>
      )}
    </>
  );
}

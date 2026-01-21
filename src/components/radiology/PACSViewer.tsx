import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePACSHealth, usePACSStudies, usePACSSeries, PACSStudy, PACSSeries, getPACSThumbnailUrl, getPACSImageUrl } from '@/hooks/usePACS';
import { 
  Radio, 
  AlertCircle, 
  Server, 
  RefreshCw, 
  Image as ImageIcon,
  ChevronRight,
  Calendar,
  Hash,
  ZoomIn,
  ZoomOut,
  X
} from 'lucide-react';
import { format, parse } from 'date-fns';

interface PACSViewerProps {
  patientId?: string;
  onStudySelect?: (study: PACSStudy) => void;
}

export function PACSViewer({ patientId, onStudySelect }: PACSViewerProps) {
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = usePACSHealth();
  const { data: studies, isLoading: studiesLoading, refetch: refetchStudies } = usePACSStudies(patientId, {
    enabled: health?.status === 'connected' && !!patientId,
  });
  
  const [selectedStudy, setSelectedStudy] = useState<PACSStudy | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  // PACS not configured
  if (!healthLoading && (!health?.configured || health.status === 'not_configured')) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-3 rounded-full bg-muted">
              <Server className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">PACS Not Configured</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Connect to a PACS server to view and manage DICOM images.
              </p>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              To enable PACS integration, add the following environment variables:
              <code className="block mt-2 p-2 bg-muted rounded text-left">
                PACS_SERVER_URL=http://your-pacs-server:8042<br/>
                PACS_USERNAME=username (optional)<br/>
                PACS_PASSWORD=password (optional)
              </code>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // PACS connection error
  if (health?.status === 'error') {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold">PACS Connection Error</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {health.message || 'Unable to connect to the PACS server.'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchHealth()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No patient selected
  if (!patientId) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center text-muted-foreground">
          Select a patient to view their PACS studies
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              PACS Studies
            </CardTitle>
            <div className="flex items-center gap-2">
              {health?.status === 'connected' && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  Connected
                </Badge>
              )}
              <Button variant="ghost" size="icon" onClick={() => refetchStudies()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {studiesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !studies?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No studies found for this patient</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {studies.map(study => (
                  <button
                    key={study.studyInstanceUID}
                    onClick={() => {
                      setSelectedStudy(study);
                      setViewerOpen(true);
                      onStudySelect?.(study);
                    }}
                    className="w-full p-3 border rounded-lg hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{study.studyDescription || 'Unnamed Study'}</span>
                          {study.modalities.map(mod => (
                            <Badge key={mod} variant="secondary" className="text-xs">
                              {mod}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {study.studyDate ? formatDicomDate(study.studyDate) : '-'}
                          </span>
                          {study.accessionNumber && (
                            <span className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {study.accessionNumber}
                            </span>
                          )}
                          <span>{study.seriesCount} series • {study.instanceCount} images</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Study Viewer Dialog */}
      <PACSStudyViewer
        study={selectedStudy}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
      />
    </>
  );
}

function PACSStudyViewer({ study, open, onOpenChange }: { study: PACSStudy | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: series, isLoading } = usePACSSeries(study?.studyInstanceUID, { enabled: open && !!study });
  const [selectedSeries, setSelectedSeries] = useState<PACSSeries | null>(null);
  const [zoom, setZoom] = useState(100);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  if (!study) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {study.studyDescription || 'Study Viewer'}
            <Badge variant="outline">{study.modalities.join(', ')}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 h-full min-h-0">
          {/* Series List */}
          <div className="w-64 border-r pr-4 overflow-auto">
            <h4 className="font-medium mb-3">Series</h4>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {series?.map(s => (
                  <button
                    key={s.seriesInstanceUID}
                    onClick={() => setSelectedSeries(s)}
                    className={`w-full p-2 border rounded-lg text-left transition-colors ${
                      selectedSeries?.seriesInstanceUID === s.seriesInstanceUID
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square bg-black rounded mb-2 flex items-center justify-center overflow-hidden">
                      <img
                        src={getPACSThumbnailUrl(study.studyInstanceUID, s.seriesInstanceUID)}
                        alt={s.seriesDescription}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '';
                          (e.target as HTMLImageElement).alt = 'No preview';
                        }}
                      />
                    </div>
                    <div className="text-xs">
                      <p className="font-medium truncate">{s.seriesDescription || `Series ${s.seriesNumber}`}</p>
                      <p className="text-muted-foreground">{s.modality} • {s.instanceCount} images</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Image Viewer */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b mb-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(25, z - 25))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm w-16 text-center">{zoom}%</span>
                <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(400, z + 25))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setZoom(100)}>
                  Fit
                </Button>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Image Display */}
            <div className="flex-1 bg-black rounded-lg flex items-center justify-center overflow-auto">
              {selectedSeries ? (
                <img
                  src={getPACSThumbnailUrl(study.studyInstanceUID, selectedSeries.seriesInstanceUID)}
                  alt={selectedSeries.seriesDescription}
                  style={{ transform: `scale(${zoom / 100})` }}
                  className="max-w-full max-h-full object-contain transition-transform"
                />
              ) : (
                <div className="text-white/50 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                  <p>Select a series to view</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatDicomDate(dateStr: string): string {
  try {
    // DICOM date format: YYYYMMDD
    const date = parse(dateStr, 'yyyyMMdd', new Date());
    return format(date, 'MMM dd, yyyy');
  } catch {
    return dateStr;
  }
}

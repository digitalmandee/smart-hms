import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useImagingOrder, useUpdateImagingOrder } from '@/hooks/useImaging';
import { ImagingStatusBadge } from '@/components/radiology/ImagingStatusBadge';
import { ModalityBadge } from '@/components/radiology/ModalityBadge';
import { ImagingPriorityBadge } from '@/components/radiology/ImagingPriorityBadge';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Camera, 
  CheckCircle, 
  Upload,
  Image as ImageIcon,
  X,
  MonitorUp,
  HardDrive
} from 'lucide-react';

type ImageSource = 'pacs' | 'upload';

export default function ImageCapturePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useImagingOrder(id);
  const { mutate: updateOrder, isPending: isUpdating } = useUpdateImagingOrder();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageSource, setImageSource] = useState<ImageSource>('upload');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [techNotes, setTechNotes] = useState('');

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Order not found</p>
        <Button variant="link" onClick={() => navigate('/app/radiology/worklist')}>
          Back to Worklist
        </Button>
      </div>
    );
  }

  const handleStartStudy = () => {
    updateOrder({ id: order.id, status: 'in_progress' }, {
      onSuccess: () => toast.success('Study started')
    });
  };

  const handleCompleteStudy = () => {
    updateOrder({ 
      id: order.id, 
      status: 'completed', 
      performed_at: new Date().toISOString(),
      notes: techNotes || order.notes,
    }, {
      onSuccess: () => {
        toast.success('Study completed - ready for reporting');
        navigate('/app/radiology/worklist');
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages(prev => [...prev, event.target!.result as string]);
          toast.success(`${file.name} uploaded`);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePACSFetch = () => {
    // Simulated PACS fetch - in production would call PACS gateway
    toast.info('Fetching images from PACS...');
    setTimeout(() => {
      const mockImages = [
        `https://placehold.co/600x400/1a1a2e/eee?text=PACS+Image+1`,
        `https://placehold.co/600x400/1a1a2e/eee?text=PACS+Image+2`,
      ];
      setUploadedImages(prev => [...prev, ...mockImages]);
      toast.success('Images fetched from PACS');
    }, 1500);
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Image Capture"
        description={`Order: ${order.order_number}`}
        actions={
          <Button variant="outline" onClick={() => navigate('/app/radiology/worklist')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Worklist
          </Button>
        }
      />

      {/* Image Source Toggle */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Image Source</p>
              <p className="text-xs text-muted-foreground">Choose how to capture/import images</p>
            </div>
            <Tabs value={imageSource} onValueChange={(v) => setImageSource(v as ImageSource)}>
              <TabsList>
                <TabsTrigger value="pacs" className="gap-2">
                  <HardDrive className="h-4 w-4" />
                  PACS
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2">
                  <MonitorUp className="h-4 w-4" />
                  Upload
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <ModalityBadge modality={order.modality} />
              <ImagingStatusBadge status={order.status} />
              <ImagingPriorityBadge priority={order.priority} showIcon />
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Patient</p>
              <p className="text-sm font-medium">
                {order.patient?.first_name} {order.patient?.last_name}
              </p>
              <p className="text-xs text-muted-foreground">{order.patient?.patient_number}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Procedure</p>
              <p className="text-sm font-medium">{order.procedure_name}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Clinical Indication</p>
              <p className="text-sm">{order.clinical_indication || 'Not specified'}</p>
            </div>

            {order.status === 'ordered' && (
              <Button onClick={handleStartStudy} disabled={isUpdating} className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Start Study
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Image Capture Area */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Captured Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.status === 'ordered' ? (
              <div className="text-center py-8 text-muted-foreground">
                Click "Start Study" to begin capturing images
              </div>
            ) : (
              <div className="space-y-4">
                {/* Uploaded Images Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={img} 
                          alt={`Captured ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* PACS or Upload UI */}
                {imageSource === 'pacs' ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <HardDrive className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm font-medium mb-2">PACS Integration</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Fetch images directly from your PACS server
                    </p>
                    <Button onClick={handlePACSFetch}>
                      <HardDrive className="h-4 w-4 mr-2" />
                      Fetch from PACS
                    </Button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div 
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm font-medium mb-1">Click to upload images</p>
                      <p className="text-xs text-muted-foreground">
                        Supports JPG, PNG, DICOM files
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Technician Notes */}
      {(order.status === 'in_progress' || order.status === 'completed') && (
        <Card>
          <CardHeader>
            <CardTitle>Technician Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="techNotes">Notes (optional)</Label>
              <Textarea
                id="techNotes"
                value={techNotes}
                onChange={(e) => setTechNotes(e.target.value)}
                placeholder="Any observations, patient positioning notes, contrast used, etc."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                onClick={handleCompleteStudy} 
                disabled={isUpdating || uploadedImages.length === 0}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Study
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  X
} from 'lucide-react';

export default function ImageCapturePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useImagingOrder(id);
  const { mutate: updateOrder, isPending: isUpdating } = useUpdateImagingOrder();

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

  const handleImageUpload = () => {
    // Simulated image upload - in real app would integrate with PACS/file storage
    const mockImageUrl = `https://placehold.co/600x400?text=Image+${uploadedImages.length + 1}`;
    setUploadedImages(prev => [...prev, mockImageUrl]);
    toast.success('Image uploaded');
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

                {/* Upload Button */}
                <div 
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={handleImageUpload}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to capture/upload images
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (In production, this would integrate with PACS)
                  </p>
                </div>
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

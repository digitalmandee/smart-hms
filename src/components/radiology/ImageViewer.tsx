import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Maximize2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { toast } from 'sonner';

interface ImageViewerProps {
  images: string[];
  className?: string;
}

export function ImageViewer({ images, className }: ImageViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  if (!images || images.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64 bg-muted rounded-lg", className)}>
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoom(1);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));

  const handleDownload = (imageUrl: string, index: number) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `image-${index + 1}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const handleDownloadAll = () => {
    images.forEach((url, index) => {
      setTimeout(() => handleDownload(url, index), index * 200);
    });
  };

  return (
    <>
      <div className={cn("relative", className)}>
        {/* Main Image Display */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <img
            src={images[selectedIndex]}
            alt={`Study image ${selectedIndex + 1}`}
            className="w-full h-full object-contain"
          />
          
          {/* Image Controls */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-lg p-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handlePrevious}
              disabled={images.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-white text-sm px-2">
              {selectedIndex + 1} / {images.length}
            </span>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleNext}
              disabled={images.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-white/30 mx-1" />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => handleDownload(images[selectedIndex], selectedIndex)}
              title="Download image"
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setIsFullscreen(true)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden",
                  idx === selectedIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-none">
          <VisuallyHidden>
            <DialogTitle>Image Viewer</DialogTitle>
            <DialogDescription>Full screen view of study images</DialogDescription>
          </VisuallyHidden>
          <div className="relative w-full h-[90vh]">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Image */}
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={images[selectedIndex]}
                alt={`Study image ${selectedIndex + 1}`}
                className="max-w-full max-h-full object-contain transition-transform"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 rounded-lg p-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/20"
                onClick={handlePrevious}
                disabled={images.length <= 1}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/20"
                onClick={handleZoomOut}
              >
                <ZoomOut className="h-5 w-5" />
              </Button>

              <span className="text-white text-sm px-2 min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/20"
                onClick={handleZoomIn}
              >
                <ZoomIn className="h-5 w-5" />
              </Button>

              <div className="w-px h-6 bg-white/30 mx-1" />

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/20"
                onClick={() => handleDownload(images[selectedIndex], selectedIndex)}
                title="Download current image"
              >
                <Download className="h-5 w-5" />
              </Button>

              <span className="text-white text-sm px-4">
                {selectedIndex + 1} / {images.length}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/20"
                onClick={handleNext}
                disabled={images.length <= 1}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUpdatePatient } from "@/hooks/usePatients";
import { Camera, Upload, RefreshCw, Check, X, User, Loader2 } from "lucide-react";

interface PatientPhotoCaptureProps {
  patientId: string;
  patientName: string;
  currentPhotoUrl?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoUpdated?: (url: string) => void;
}

export function PatientPhotoCapture({
  patientId,
  patientName,
  currentPhotoUrl,
  open,
  onOpenChange,
  onPhotoUpdated,
}: PatientPhotoCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const updatePatient = useUpdatePatient();

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error: any) {
      console.error("Camera access error:", error);
      setCameraError(
        error.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera permissions."
          : error.name === "NotFoundError"
          ? "No camera found on this device."
          : "Failed to access camera. Try uploading a photo instead."
      );
      setIsCameraActive(false);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  // Cleanup on dialog close
  useEffect(() => {
    if (!open) {
      stopCamera();
      setCapturedImage(null);
      setCameraError(null);
    }
  }, [open, stopCamera]);

  // Connect video element to stream
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Capture photo from video
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL("image/jpeg", 0.85);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  // Handle file upload
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  }, [stopCamera, toast]);

  // Reset capture
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  // Upload and save photo
  const savePhoto = useCallback(async () => {
    if (!capturedImage) return;

    setIsUploading(true);
    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Generate unique filename
      const filename = `${patientId}-${Date.now()}.jpg`;
      const filePath = `${patientId}/${filename}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("patient-photos")
        .upload(filePath, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get signed URL (bucket is private)
      const { data: signedData, error: signedError } = await supabase.storage
        .from("patient-photos")
        .createSignedUrl(filePath, 3600);

      if (signedError || !signedData?.signedUrl) throw signedError || new Error("Failed to generate signed URL");

      const photoUrl = signedData.signedUrl;

      // Store the storage path (not signed URL) in patient record
      await updatePatient.mutateAsync({
        id: patientId,
        data: { profile_photo_url: filePath },
      });

      toast({
        title: "Photo saved",
        description: "Patient photo has been updated successfully.",
      });

      onPhotoUpdated?.(photoUrl);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Photo upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to save photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [capturedImage, patientId, updatePatient, onOpenChange, onPhotoUpdated, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Patient Photo
          </DialogTitle>
          <DialogDescription>
            Take a photo or upload an image for {patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera / Preview Area */}
          <div className="relative aspect-square w-full max-w-[300px] mx-auto bg-muted rounded-lg overflow-hidden">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            ) : isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                {cameraError ? (
                  <>
                    <X className="h-10 w-10 mb-2 text-destructive" />
                    <p className="text-sm">{cameraError}</p>
                  </>
                ) : currentPhotoUrl ? (
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={currentPhotoUrl} alt={patientName} />
                    <AvatarFallback>
                      <User className="h-16 w-16" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <>
                    <User className="h-16 w-16 mb-2" />
                    <p className="text-sm">No photo yet</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            {capturedImage ? (
              <>
                <Button variant="outline" onClick={retakePhoto} disabled={isUploading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                <Button onClick={savePhoto} disabled={isUploading}>
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Save Photo
                </Button>
              </>
            ) : isCameraActive ? (
              <Button onClick={capturePhoto} size="lg">
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
            ) : (
              <>
                <Button onClick={startCamera} variant="default">
                  <Camera className="h-4 w-4 mr-2" />
                  Open Camera
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
              </>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <DialogFooter className="sm:justify-start">
          <p className="text-xs text-muted-foreground">
            Photos are stored securely and used for patient identification only.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

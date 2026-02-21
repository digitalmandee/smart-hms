import { useState, useRef, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, ScanLine } from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { cn } from "@/lib/utils";

interface InlineBarcodeScannerProps {
  onScan: (code: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
}

export function InlineBarcodeScannerInput({
  onScan,
  placeholder = "Scan or type barcode...",
  autoFocus = false,
  disabled = false,
  className,
}: InlineBarcodeScannerProps) {
  const [code, setCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerHaptic = useCallback(async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      // Not on native — ignore
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = code.trim();
    if (!trimmed) return;
    triggerHaptic();
    onScan(trimmed);
    setCode("");
    inputRef.current?.focus();
  }, [code, onScan, triggerHaptic]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setCameraError("Camera access denied");
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className="pl-9 text-base min-h-[48px]"
          />
        </div>
        <Button
          type="button"
          variant={cameraActive ? "destructive" : "outline"}
          size="icon"
          className="min-h-[48px] min-w-[48px]"
          onClick={cameraActive ? stopCamera : startCamera}
          disabled={disabled}
        >
          {cameraActive ? <CameraOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
        </Button>
      </div>

      {cameraError && (
        <p className="text-xs text-destructive">{cameraError}</p>
      )}

      {cameraActive && (
        <div className="relative rounded-lg overflow-hidden bg-muted aspect-video max-h-48">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-primary/70 rounded-lg w-3/4 h-1/3" />
          </div>
          <p className="absolute bottom-1 left-0 right-0 text-center text-xs text-white bg-black/50 py-1">
            Point at barcode, then type the code above
          </p>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useCallback, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera, CameraOff, Search, Package, Eye, Printer, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface FoundItem {
  id: string;
  item_code: string;
  name: string;
  barcode: string | null;
  unit_of_measure: string;
  current_stock?: number;
}

export default function BarcodeScannerSetup() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState("");
  const [foundItem, setFoundItem] = useState<FoundItem | null>(null);
  const [searching, setSearching] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const lookupItem = useCallback(async (code: string) => {
    if (!profile?.organization_id || !code.trim()) return;
    setSearching(true);
    setFoundItem(null);
    try {
      const query = supabase
        .from("inventory_items")
        .select("id, item_code, name, barcode, unit_of_measure")
        .eq("organization_id", profile.organization_id);
      const { data } = await (query as any)
        .or(`barcode.eq.${code.trim()},item_code.eq.${code.trim()}`)
        .limit(1)
        .maybeSingle();

      if (data) {
        // Get stock level
        const { data: stockData } = await (supabase
          .from("inventory_stock") as any)
          .select("quantity")
          .eq("item_id", data.id)
          .eq("organization_id", profile.organization_id);

        const totalStock = stockData?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0;
        setFoundItem({ ...data, current_stock: totalStock });
        toast.success(`Found: ${data.name}`);
      } else {
        toast.error("Item not found for this code");
      }
    } catch {
      toast.error("Item not found");
    } finally {
      setSearching(false);
    }
  }, [profile?.organization_id]);

  const handleManualSearch = () => {
    if (manualCode.trim()) lookupItem(manualCode.trim());
  };

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
      setCameraError("Camera access denied. Please allow camera permissions or use manual entry.");
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
    <div className="space-y-6">
      <PageHeader
        title="Barcode / QR Scanner"
        description="Scan barcodes to look up inventory items instantly"
        breadcrumbs={[
          { label: "Inventory", href: "/app/inventory" },
          { label: "Integrations", href: "/app/inventory/integrations" },
          { label: "Scanner" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scan Barcode
            </CardTitle>
            <CardDescription>Use your device camera or enter the code manually</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Camera view */}
            <div className="relative rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center">
              {cameraActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-muted-foreground p-6">
                  <CameraOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Camera is off. Click "Start Camera" or enter code manually below.</p>
                </div>
              )}
              {cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-primary/70 rounded-lg w-3/4 h-1/3" />
                </div>
              )}
            </div>

            {cameraError && (
              <p className="text-sm text-destructive">{cameraError}</p>
            )}

            <div className="flex gap-2">
              {cameraActive ? (
                <Button variant="outline" onClick={stopCamera} className="flex-1">
                  <CameraOff className="mr-2 h-4 w-4" />
                  Stop Camera
                </Button>
              ) : (
                <Button onClick={startCamera} className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
              )}
            </div>

            <div className="relative">
              <p className="text-xs text-muted-foreground text-center my-2">— or enter code manually —</p>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter barcode or item code..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
              />
              <Button onClick={handleManualSearch} disabled={searching || !manualCode.trim()}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Note: Camera scanning decodes barcodes in real-time when a compatible barcode reader library is integrated. 
              For now, use the manual entry above to look up items by barcode or item code.
            </p>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Scan Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!foundItem ? (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>Scan or enter a barcode to see item details here</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
                  <h3 className="font-semibold text-lg">{foundItem.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Code: {foundItem.item_code}</Badge>
                    <Badge variant="outline">UOM: {foundItem.unit_of_measure}</Badge>
                    {foundItem.barcode && <Badge variant="secondary">Barcode: {foundItem.barcode}</Badge>}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Current Stock:</span>
                    <span className="font-bold text-lg">
                      {foundItem.current_stock ?? "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/app/inventory/items/${foundItem.id}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Item
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/app/inventory/stock-adjustments/new`)}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Adjust Stock
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/app/inventory/barcode-labels`)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Label
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

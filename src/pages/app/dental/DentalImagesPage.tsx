import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDentalImages } from "@/hooks/useDental";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, Image as ImageIcon } from "lucide-react";

export default function DentalImagesPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [patientId, setPatientId] = useState("");
  const { data: images } = useDentalImages(patientId || undefined);

  const { data: patients } = useQuery({
    queryKey: ["patients-list-dental", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("id, first_name, last_name, mrn_number")
        .eq("organization_id", profile!.organization_id!).order("first_name").limit(500);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const [imageType, setImageType] = useState("periapical");
  const [toothNumber, setToothNumber] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !patientId || !profile?.organization_id) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${profile.organization_id}/${patientId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("dental-images").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("dental-images").getPublicUrl(path);

      const { error: insertError } = await supabase.from("dental_images").insert({
        patient_id: patientId,
        organization_id: profile.organization_id,
        image_type: imageType,
        image_url: publicUrl,
        storage_path: path,
        tooth_number: toothNumber ? Number(toothNumber) : null,
        taken_at: new Date().toISOString(),
        uploaded_by: profile.id,
      });
      if (insertError) throw insertError;
      qc.invalidateQueries({ queryKey: ["dental-images", patientId] });
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dental Images"
        description="Periapical, OPG, and CBCT imaging"
        breadcrumbs={[{ label: "Dental", href: "/app/dental" }, { label: "Images" }]}
      />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label>Patient</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger><SelectValue placeholder="Select patient..." /></SelectTrigger>
                <SelectContent>
                  {(patients || []).map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name} — {p.mrn_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Image Type</Label>
              <Select value={imageType} onValueChange={setImageType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="periapical">Periapical</SelectItem>
                  <SelectItem value="opg">OPG</SelectItem>
                  <SelectItem value="cbct">CBCT</SelectItem>
                  <SelectItem value="bitewing">Bitewing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tooth #</Label>
              <Input type="number" value={toothNumber} onChange={e => setToothNumber(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          {patientId && (
            <div>
              <Label htmlFor="dental-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Upload className="h-4 w-4" />{uploading ? "Uploading..." : "Upload Image"}
              </Label>
              <input id="dental-upload" type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </div>
          )}
        </CardContent>
      </Card>

      {patientId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(images || []).length === 0 ? (
            <Card className="col-span-full"><CardContent className="py-12 text-center text-muted-foreground">No images uploaded for this patient.</CardContent></Card>
          ) : (
            (images as any[]).map((img: any) => (
              <Card key={img.id}>
                <CardContent className="pt-4">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3">
                    {img.image_url ? (
                      <img src={img.image_url} alt={`Dental ${img.image_type}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-12 w-12 text-muted-foreground" /></div>
                    )}
                  </div>
                  <p className="font-medium text-sm capitalize">{img.image_type}</p>
                  <p className="text-xs text-muted-foreground">
                    {img.tooth_number ? `Tooth #${img.tooth_number} • ` : ""}{new Date(img.taken_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

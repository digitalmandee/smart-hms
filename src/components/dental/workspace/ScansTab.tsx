import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import { useDentalT } from "@/lib/dental/i18n";
import { useDentalImages } from "@/hooks/useDental";

interface Props {
  patientId: string;
  /** filter by image type keyword, e.g. "cbct" */
  filter?: string;
  titleKey: string;
}

export default function ScansTab({ patientId, filter, titleKey }: Props) {
  const { dt } = useDentalT();
  const { data: images } = useDentalImages(patientId);
  const list = (images || []).filter((i: any) =>
    !filter ? true : String(i.image_type || "").toLowerCase().includes(filter)
  );

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <CardTitle className="text-base">{dt(titleKey)}</CardTitle>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link to="/app/dental/images">
            <Upload className="h-4 w-4" /> {dt("dw.scan.upload")}
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!list.length ? (
          <p className="text-sm text-muted-foreground">{dt("dw.scan.none")}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((img: any) => (
              <div key={img.id} className="border rounded-lg overflow-hidden">
                {img.image_url && (
                  <img
                    src={img.image_url}
                    alt={img.image_type || "Dental image"}
                    loading="lazy"
                    className="w-full h-32 object-cover bg-muted"
                  />
                )}
                <div className="p-2 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">{img.image_type || "image"}</Badge>
                    {img.tooth_number && <Badge variant="secondary" className="text-[10px]">#{img.tooth_number}</Badge>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {img.taken_at ? new Date(img.taken_at).toLocaleDateString() : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

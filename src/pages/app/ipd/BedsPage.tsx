import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWards, useBeds } from "@/hooks/useIPD";
import { BedMap } from "@/components/ipd/BedMap";
import { BedDetailCard } from "@/components/ipd/BedDetailCard";
import { Badge } from "@/components/ui/badge";
import { Building2, Bed } from "lucide-react";

export default function BedsPage() {
  const navigate = useNavigate();
  const [selectedWardId, setSelectedWardId] = useState<string>("");
  const [selectedBed, setSelectedBed] = useState<any>(null);

  const { data: wards, isLoading: loadingWards } = useWards();
  const { data: beds, isLoading: loadingBeds } = useBeds(selectedWardId || undefined);

  const selectedWard = wards?.find((w: any) => w.id === selectedWardId);

  // Summary stats
  const totalBeds = beds?.length || 0;
  const availableBeds = beds?.filter((b: any) => b.status === "available").length || 0;
  const occupiedBeds = beds?.filter((b: any) => b.status === "occupied").length || 0;
  const reservedBeds = beds?.filter((b: any) => b.status === "reserved").length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bed Management"
        description="View and manage bed allocation across wards"
      />

      {/* Ward Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Select Ward:</span>
        </div>
        <Select value={selectedWardId} onValueChange={setSelectedWardId}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Choose a ward" />
          </SelectTrigger>
          <SelectContent>
            {loadingWards ? (
              <SelectItem value="loading" disabled>Loading...</SelectItem>
            ) : (
              (wards || []).map((ward: any) => (
                <SelectItem key={ward.id} value={ward.id}>
                  {ward.name} ({ward.code})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {/* Quick Stats */}
        {selectedWardId && (
          <div className="flex gap-2 ml-auto">
            <Badge variant="outline" className="bg-success/10 text-success">
              <Bed className="h-3 w-3 mr-1" />
              {availableBeds} Available
            </Badge>
            <Badge variant="outline" className="bg-destructive/10 text-destructive">
              {occupiedBeds} Occupied
            </Badge>
            {reservedBeds > 0 && (
              <Badge variant="outline" className="bg-warning/10 text-warning">
                {reservedBeds} Reserved
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {selectedWardId ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Bed Map */}
          <div className="lg:col-span-2">
            {loadingBeds ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Loading beds...
                </CardContent>
              </Card>
            ) : beds && beds.length > 0 ? (
              <BedMap
                beds={beds}
                wardName={selectedWard?.name}
                selectedBedId={selectedBed?.id}
                onBedClick={(bed) => setSelectedBed(bed)}
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No beds configured for this ward
                </CardContent>
              </Card>
            )}
          </div>

          {/* Bed Details */}
          <div>
            {selectedBed ? (
              <BedDetailCard
                bed={selectedBed}
                onClose={() => setSelectedBed(null)}
                onTransfer={() => {
                  // TODO: Open transfer modal
                }}
                onViewPatient={(patientId) => navigate(`/app/patients/${patientId}`)}
                onViewAdmission={(admissionId) => navigate(`/app/ipd/admissions/${admissionId}`)}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bed Details</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-8">
                  Click on a bed to view details
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a ward to view bed map</p>
          </CardContent>
        </Card>
      )}

      {/* Ward Overview Cards */}
      {!selectedWardId && wards && wards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">All Wards Overview</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(wards || []).map((ward: any) => {
              const wardBeds = ward.beds || [];
              const available = wardBeds.filter((b: any) => b.status === "available").length;
              const occupied = wardBeds.filter((b: any) => b.status === "occupied").length;
              const total = wardBeds.length;

              return (
                <Card
                  key={ward.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedWardId(ward.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{ward.name}</span>
                      <Badge variant="outline">{ward.code}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Beds:</span>
                      <span>
                        <span className="text-success font-medium">{available}</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span>{total}</span>
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-destructive/70"
                        style={{ width: `${total > 0 ? (occupied / total) * 100 : 0}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

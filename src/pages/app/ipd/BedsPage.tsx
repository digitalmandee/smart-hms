import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { BedActionsMenu } from "@/components/ipd/BedActionsMenu";
import { BedTransferModal } from "@/components/ipd/BedTransferModal";
import { QuickAddBedModal } from "@/components/ipd/QuickAddBedModal";
import { Badge } from "@/components/ui/badge";
import { Building2, Bed, Plus, Search, Wrench, Sparkles, Grid3X3, Pencil, Settings2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type BedStatusFilter = "all" | "available" | "occupied" | "reserved" | "maintenance" | "housekeeping";

export default function BedsPage() {
  const navigate = useNavigate();
  const [selectedWardId, setSelectedWardId] = useState<string>("");
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<BedStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [gridSize, setGridSize] = useState({ rows: 4, cols: 6 });

  const { data: wards, isLoading: loadingWards } = useWards();
  const { data: beds, isLoading: loadingBeds, refetch: refetchBeds } = useBeds(selectedWardId || undefined);

  const selectedWard = wards?.find((w: any) => w.id === selectedWardId);

  // Filter beds
  const filteredBeds = beds?.filter((bed: any) => {
    const matchesStatus = statusFilter === "all" || bed.status === statusFilter;
    const matchesSearch = searchQuery === "" || 
      bed.bed_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  // Summary stats
  const totalBeds = beds?.length || 0;
  const availableBeds = beds?.filter((b: any) => b.status === "available").length || 0;
  const occupiedBeds = beds?.filter((b: any) => b.status === "occupied").length || 0;
  const reservedBeds = beds?.filter((b: any) => b.status === "reserved").length || 0;
  const maintenanceBeds = beds?.filter((b: any) => b.status === "maintenance").length || 0;
  const housekeepingBeds = beds?.filter((b: any) => b.status === "housekeeping").length || 0;

  const handleTransferSuccess = () => {
    setTransferModalOpen(false);
    setSelectedBed(null);
    refetchBeds();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bed Management"
        description="View and manage bed allocation across wards"
        actions={
          <div className="flex gap-2">
            {selectedWardId && (
              <>
                <Button 
                  variant={isEditMode ? "default" : "outline"} 
                  onClick={() => setIsEditMode(!isEditMode)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  {isEditMode ? "Done Editing" : "Edit Layout"}
                </Button>
                {isEditMode && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56" align="end">
                      <div className="space-y-3">
                        <div className="font-medium text-sm">Grid Size</div>
                        <div className="flex items-center gap-2">
                          <div className="space-y-1 flex-1">
                            <Label className="text-xs">Rows</Label>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              value={gridSize.rows}
                              onChange={(e) => setGridSize(prev => ({ ...prev, rows: parseInt(e.target.value) || 1 }))}
                              className="h-8"
                            />
                          </div>
                          <span className="mt-5">×</span>
                          <div className="space-y-1 flex-1">
                            <Label className="text-xs">Cols</Label>
                            <Input
                              type="number"
                              min={1}
                              max={12}
                              value={gridSize.cols}
                              onChange={(e) => setGridSize(prev => ({ ...prev, cols: parseInt(e.target.value) || 1 }))}
                              className="h-8"
                            />
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
                <Button variant="outline" onClick={() => setQuickAddModalOpen(true)}>
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Bulk Add
                </Button>
              </>
            )}
            <Button onClick={() => navigate(`/app/ipd/beds/new${selectedWardId ? `?wardId=${selectedWardId}` : ""}`)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Bed
            </Button>
          </div>
        }
      />

      {/* Ward Selector & Filters */}
      <div className="flex flex-col gap-4">
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
            <div className="flex flex-wrap gap-2 ml-auto">
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
              {maintenanceBeds > 0 && (
                <Badge variant="outline" className="bg-orange-500/10 text-orange-600">
                  <Wrench className="h-3 w-3 mr-1" />
                  {maintenanceBeds}
                </Badge>
              )}
              {housekeepingBeds > 0 && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {housekeepingBeds}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Search & Filter */}
        {selectedWardId && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bed number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BedStatusFilter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="housekeeping">Housekeeping</SelectItem>
              </SelectContent>
            </Select>
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
            ) : filteredBeds.length > 0 ? (
              <BedMap
                beds={filteredBeds}
                wardId={selectedWardId}
                wardName={selectedWard?.name}
                selectedBedId={selectedBed?.id}
                onBedClick={(bed) => setSelectedBed(bed)}
                isEditMode={isEditMode}
                gridSize={isEditMode ? gridSize : undefined}
                onBedCreated={() => refetchBeds()}
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  {beds?.length === 0 
                    ? "No beds configured for this ward" 
                    : "No beds match the current filters"}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Bed Details */}
          <div>
            {selectedBed ? (
              <div className="space-y-4">
                <BedDetailCard
                  bed={selectedBed}
                  onClose={() => setSelectedBed(null)}
                  onTransfer={() => setTransferModalOpen(true)}
                  onViewPatient={(patientId) => navigate(`/app/patients/${patientId}`)}
                  onViewAdmission={(admissionId) => navigate(`/app/ipd/admissions/${admissionId}`)}
                  onViewProfile={(bedId) => navigate(`/app/ipd/beds/${bedId}/profile`)}
                  onAdmitPatient={(bedId, wardId) => navigate(`/app/ipd/admissions/new?bedId=${bedId}&wardId=${wardId}`)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/app/ipd/beds/${selectedBed.id}/edit`)}
                  >
                    Edit Bed
                  </Button>
                  <BedActionsMenu
                    bed={selectedBed}
                    onTransfer={() => setTransferModalOpen(true)}
                    onViewPatient={selectedBed.current_admission?.patient?.id 
                      ? () => navigate(`/app/patients/${selectedBed.current_admission.patient.id}`) 
                      : undefined}
                    onViewAdmission={selectedBed.current_admission?.id 
                      ? () => navigate(`/app/ipd/admissions/${selectedBed.current_admission.id}`) 
                      : undefined}
                    onViewProfile={() => navigate(`/app/ipd/beds/${selectedBed.id}/profile`)}
                  />
                </div>
              </div>
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

      {/* Transfer Modal */}
      {selectedBed?.current_admission && (
        <BedTransferModal
          open={transferModalOpen}
          onOpenChange={setTransferModalOpen}
          admission={{
            id: selectedBed.current_admission.id,
            admission_number: selectedBed.current_admission.admission_number,
            patient: selectedBed.current_admission.patient,
            ward: selectedBed.ward,
            bed: selectedBed,
          }}
          onSuccess={handleTransferSuccess}
        />
      )}

      {/* Quick Add Modal */}
      {selectedWardId && (
        <QuickAddBedModal
          open={quickAddModalOpen}
          onOpenChange={setQuickAddModalOpen}
          wardId={selectedWardId}
          wardName={selectedWard?.name}
          onSuccess={() => refetchBeds()}
        />
      )}
    </div>
  );
}

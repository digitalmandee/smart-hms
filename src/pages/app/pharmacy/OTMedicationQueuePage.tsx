import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Package, Clock, User, Syringe, CheckCircle2, XCircle, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOTMedicationQueue, useCancelOTMedicationRequest, useSearchMedicineInventory, OTMedicationRequest } from "@/hooks/useOTPharmacy";
import { CartItem } from "@/hooks/usePOS";

export default function OTMedicationQueuePage() {
  const navigate = useNavigate();
  const { data: queue = [], isLoading } = useOTMedicationQueue();
  const cancelRequest = useCancelOTMedicationRequest();

  const [selectedMedication, setSelectedMedication] = useState<OTMedicationRequest | null>(null);
  const [dispenseDialogOpen, setDispenseDialogOpen] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Search inventory when dispensing
  const { data: inventoryOptions = [] } = useSearchMedicineInventory(
    searchQuery, 
    selectedMedication?.medication_name
  );

  // Group requests by surgery
  const groupedBySurgery = queue.reduce((acc, item) => {
    const surgeryId = item.surgery_id;
    if (!acc[surgeryId]) {
      acc[surgeryId] = {
        surgery: item.surgery,
        medications: [],
      };
    }
    acc[surgeryId].medications.push(item);
    return acc;
  }, {} as Record<string, { surgery: OTMedicationRequest['surgery']; medications: OTMedicationRequest[] }>);

  const handleOpenDispenseDialog = (medication: OTMedicationRequest) => {
    setSelectedMedication(medication);
    setSelectedInventoryId("");
    setSearchQuery("");
    setDispenseDialogOpen(true);
  };

  const handleDispense = () => {
    if (!selectedMedication || !selectedInventoryId) return;

    const selectedItem = inventoryOptions.find(i => i.id === selectedInventoryId);
    if (!selectedItem) return;

    // Build cart item matching POS CartItem interface
    const cartItem: CartItem = {
      id: `ot-${selectedMedication.id}`,
      inventory_id: selectedInventoryId,
      medicine_id: selectedItem.medicine?.id || null,
      medicine_name: selectedItem.medicine?.name || selectedMedication.medication_name,
      batch_number: selectedItem.batch_number || null,
      quantity: 1,
      unit_price: selectedItem.selling_price || selectedItem.unit_price || 0,
      selling_price: selectedItem.selling_price || selectedItem.unit_price || 0,
      available_quantity: selectedItem.quantity,
      discount_percent: 0,
      tax_percent: 0,
    };

    // Get patient info from surgery
    const patient = selectedMedication.surgery?.patient;

    // Close dialog before navigating
    setDispenseDialogOpen(false);
    setSelectedMedication(null);

    // Navigate to POS with cart pre-loaded
    navigate("/app/pharmacy/pos", {
      state: {
        prescriptionCart: [cartItem],
        patient: patient ? {
          id: patient.id,
          patient_number: patient.patient_number,
          first_name: patient.first_name,
          last_name: patient.last_name,
        } : null,
        otMedicationId: selectedMedication.id,
        surgeryId: selectedMedication.surgery_id,
        otMedicationName: selectedMedication.medication_name,
      },
    });
  };

  const handleCancel = (medication: OTMedicationRequest) => {
    if (confirm(`Cancel pharmacy request for ${medication.medication_name}?`)) {
      cancelRequest.mutate({
        medicationId: medication.id,
        surgeryId: medication.surgery_id,
      });
    }
  };

  const getTimingBadge = (timing: string) => {
    const config = {
      pre_op: { label: 'Pre-Op', variant: 'default' as const },
      intra_op: { label: 'Intra-Op', variant: 'secondary' as const },
      post_op: { label: 'Post-Op', variant: 'outline' as const },
    };
    const { label, variant } = config[timing as keyof typeof config] || { label: timing, variant: 'outline' as const };
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">OT Medication Requests</h1>
            <p className="text-muted-foreground">Pending medication requests from Operation Theatre</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Clock className="h-4 w-4 mr-2" />
          {queue.length} Pending
        </Badge>
      </div>

      {/* Queue Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : queue.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold">All Caught Up!</h3>
            <p className="text-muted-foreground">No pending OT medication requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedBySurgery).map(([surgeryId, { surgery, medications }]) => (
            <Card key={surgeryId}>
              <CardHeader className="bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Syringe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {surgery?.surgery_number || 'Surgery'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {surgery?.procedure_name || 'Procedure'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      <span className="font-medium">
                        {`${surgery?.patient?.first_name || ''} ${surgery?.patient?.last_name || ''}`.trim() || 'Unknown'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {surgery?.patient?.patient_number}
                    </p>
                    {surgery?.scheduled_date && (
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(surgery.scheduled_date), 'dd MMM yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {medications.map((med) => (
                    <div 
                      key={med.id} 
                      className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{med.medication_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {med.dosage && <span>{med.dosage}</span>}
                            {med.route && <span>• {med.route}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getTimingBadge(med.timing)}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(med)}
                            disabled={cancelRequest.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleOpenDispenseDialog(med)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Dispense
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dispense Dialog */}
      <Dialog open={dispenseDialogOpen} onOpenChange={setDispenseDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dispense Medication</DialogTitle>
            <DialogDescription>
              Select inventory batch to dispense for this OT medication request
            </DialogDescription>
          </DialogHeader>

          {selectedMedication && (
            <div className="space-y-4">
              {/* Medication Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-semibold text-lg">{selectedMedication.medication_name}</p>
                <div className="flex gap-2 mt-1 text-sm text-muted-foreground">
                  {selectedMedication.dosage && <span>{selectedMedication.dosage}</span>}
                  {selectedMedication.route && <span>• {selectedMedication.route}</span>}
                </div>
                <div className="mt-2">
                  {getTimingBadge(selectedMedication.timing)}
                </div>
              </div>

              {/* Inventory Search */}
              <div className="space-y-2">
                <Label>Search Inventory</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by medicine name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Inventory Selection */}
              <div className="space-y-2">
                <Label>Select Batch (FIFO)</Label>
                {inventoryOptions.length > 0 ? (
                  <ScrollArea className="h-48 border rounded-lg">
                    <div className="p-2 space-y-2">
                      {inventoryOptions.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedInventoryId(item.id)}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedInventoryId === item.id 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{item.medicine?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Batch: {item.batch_number || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant={item.quantity > 10 ? 'default' : 'destructive'}>
                                Qty: {item.quantity}
                              </Badge>
                              <p className="text-sm font-medium mt-1">
                                ₹{(item.selling_price || item.unit_price || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Expires: {item.expiry_date ? format(new Date(item.expiry_date), 'dd MMM yyyy') : 'N/A'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="p-8 text-center border rounded-lg">
                    <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      {searchQuery.length < 2 
                        ? 'Type at least 2 characters to search' 
                        : 'No matching inventory found'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDispenseDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDispense}
              disabled={!selectedInventoryId}
            >
              Proceed to POS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

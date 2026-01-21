import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAdmissions } from "@/hooks/useAdmissions";
import { useIPDCharges, useCreateIPDCharge } from "@/hooks/useDischarge";
import { Receipt, Plus, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const IPDChargesPage = () => {
  const [selectedAdmission, setSelectedAdmission] = useState<string>("");
  const [addChargeOpen, setAddChargeOpen] = useState(false);
  const [chargeForm, setChargeForm] = useState({
    description: "",
    quantity: "1",
    unit_price: "",
    notes: "",
  });

  const { data: admissions = [], isLoading: loadingAdmissions } = useAdmissions("admitted");
  const { data: charges = [], isLoading: loadingCharges } = useIPDCharges(selectedAdmission || undefined);
  const { mutateAsync: createCharge, isPending: creatingCharge } = useCreateIPDCharge();

  const selectedAdmissionData = admissions.find((a: any) => a.id === selectedAdmission);
  const totalCharges = charges.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0);

  const handleAddCharge = async () => {
    if (!selectedAdmission || !chargeForm.description || !chargeForm.unit_price) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await createCharge({
        admission_id: selectedAdmission,
        description: chargeForm.description,
        quantity: parseInt(chargeForm.quantity) || 1,
        unit_price: parseFloat(chargeForm.unit_price) || 0,
        charge_date: new Date().toISOString().split("T")[0],
        notes: chargeForm.notes || undefined,
      });
      
      setAddChargeOpen(false);
      setChargeForm({ description: "", quantity: "1", unit_price: "", notes: "" });
      toast.success("Charge added successfully");
    } catch (error) {
      toast.error("Failed to add charge");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="IPD Charges"
        description="Manage daily charges for admitted patients"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Patient</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAdmissions ? (
            <Skeleton className="h-10 w-full max-w-md" />
          ) : admissions.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>No admitted patients found</span>
            </div>
          ) : (
            <Select value={selectedAdmission} onValueChange={setSelectedAdmission}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select admitted patient" />
              </SelectTrigger>
              <SelectContent>
                {admissions.map((admission: any) => (
                  <SelectItem key={admission.id} value={admission.id}>
                    {admission.admission_number} - {admission.patient?.first_name}{" "}
                    {admission.patient?.last_name} 
                    {admission.bed?.bed_number ? ` (Bed ${admission.bed.bed_number})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedAdmission && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Charges</p>
                    <p className="text-2xl font-bold">Rs. {totalCharges.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Receipt className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Items</p>
                    <p className="text-2xl font-bold">{charges.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-medium">
                    {selectedAdmissionData?.patient?.first_name} {selectedAdmissionData?.patient?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAdmissionData?.bed?.bed_number 
                      ? `Bed: ${selectedAdmissionData.bed.bed_number}` 
                      : "No bed assigned"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Charge Items
                </CardTitle>
                <Button size="sm" onClick={() => setAddChargeOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Charge
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingCharges ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : charges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No charges recorded yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setAddChargeOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Charge
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {charges.map((charge: any) => (
                      <TableRow key={charge.id}>
                        <TableCell>
                          {charge.charge_date 
                            ? format(new Date(charge.charge_date), "dd MMM yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>{charge.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {charge.charge_type || "service"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{charge.quantity}</TableCell>
                        <TableCell className="text-right">
                          Rs. {(charge.unit_price || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          Rs. {(charge.total_amount || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={5} className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">
                        Rs. {totalCharges.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Add Charge Dialog */}
      <Dialog open={addChargeOpen} onOpenChange={setAddChargeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Charge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="e.g., Room Charges, Nursing Care, Lab Test"
                value={chargeForm.description}
                onChange={(e) => setChargeForm({ ...chargeForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={chargeForm.quantity}
                  onChange={(e) => setChargeForm({ ...chargeForm, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_price">Unit Price (Rs.) *</Label>
                <Input
                  id="unit_price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={chargeForm.unit_price}
                  onChange={(e) => setChargeForm({ ...chargeForm, unit_price: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={chargeForm.notes}
                onChange={(e) => setChargeForm({ ...chargeForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddChargeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCharge} disabled={creatingCharge}>
              {creatingCharge && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Charge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IPDChargesPage;

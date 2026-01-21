import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { usePostRoomCharges } from "@/hooks/useAdmissionFinancials";
import { useBedTypes } from "@/hooks/useIPDConfig";
import { useLatestDailyChargeLog } from "@/hooks/useDailyChargeLogs";
import { Receipt, Plus, DollarSign, Loader2, AlertCircle, BedDouble, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";

const IPDChargesPage = () => {
  const [selectedAdmission, setSelectedAdmission] = useState<string>("");
  const [addChargeOpen, setAddChargeOpen] = useState(false);
  const [postingRoomCharges, setPostingRoomCharges] = useState(false);
  const [chargeForm, setChargeForm] = useState({
    description: "",
    quantity: "1",
    unit_price: "",
    notes: "",
  });

  const { data: admissions = [], isLoading: loadingAdmissions } = useAdmissions("admitted");
  const { data: charges = [], isLoading: loadingCharges, refetch: refetchCharges } = useIPDCharges(selectedAdmission || undefined);
  const { mutateAsync: createCharge, isPending: creatingCharge } = useCreateIPDCharge();
  const { data: bedTypes = [] } = useBedTypes();
  const { data: latestAutoCharge } = useLatestDailyChargeLog();
  const postRoomCharges = usePostRoomCharges();

  const selectedAdmissionData = admissions.find((a: any) => a.id === selectedAdmission);
  const totalCharges = charges.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0);

  // Group charges by type
  const roomCharges = charges.filter((c: any) => c.charge_type === "room");
  const serviceCharges = charges.filter((c: any) => c.charge_type === "service");
  const medicationCharges = charges.filter((c: any) => c.charge_type === "medication");
  const otherCharges = charges.filter((c: any) => !["room", "service", "medication"].includes(c.charge_type));

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

  const handlePostRoomCharges = async () => {
    setPostingRoomCharges(true);
    try {
      const result = await postRoomCharges();
      toast.success(`Room charges posted`, {
        description: `${result.chargesPosted} charges posted, ${result.skipped} skipped (already charged or no rate)`,
      });
      refetchCharges();
    } catch (error) {
      toast.error("Failed to post room charges");
    } finally {
      setPostingRoomCharges(false);
    }
  };

  // Get bed type rate for display
  const getBedTypeRate = (bedTypeCode: string) => {
    const bedType = bedTypes.find((bt) => bt.code === bedTypeCode);
    return bedType?.daily_rate || 0;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="IPD Charges"
        description="Manage daily charges for admitted patients"
      />

      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BedDouble className="h-5 w-5" />
              Post Daily Room Charges
            </CardTitle>
            <CardDescription>
              Automatically post today's room charges for all admitted patients based on their bed type rates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <p>{admissions.length} patients currently admitted</p>
                {bedTypes.length > 0 && (
                  <p className="mt-1">
                    Rates: {bedTypes.slice(0, 3).map(bt => `${bt.name}: ${formatCurrency(bt.daily_rate || 0)}`).join(", ")}
                    {bedTypes.length > 3 && "..."}
                  </p>
                )}
              </div>
              <Button 
                onClick={handlePostRoomCharges} 
                disabled={postingRoomCharges || admissions.length === 0}
              >
                {postingRoomCharges && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Calendar className="h-4 w-4 mr-2" />
                Post Today's Charges
              </Button>
            </div>
            {latestAutoCharge && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
                {latestAutoCharge.run_date === new Date().toISOString().split("T")[0] ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    <span>
                      Today's charges posted: {latestAutoCharge.charges_posted} charged, {latestAutoCharge.skipped} skipped
                      {latestAutoCharge.errors > 0 && `, ${latestAutoCharge.errors} errors`}
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      Last run: {format(new Date(latestAutoCharge.created_at), "dd MMM yyyy, HH:mm")} 
                      ({latestAutoCharge.charges_posted} posted)
                    </span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Select Patient</CardTitle>
            <CardDescription>
              View and add charges for a specific patient
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAdmissions ? (
              <Skeleton className="h-10 w-full" />
            ) : admissions.length === 0 ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>No admitted patients found</span>
              </div>
            ) : (
              <Select value={selectedAdmission} onValueChange={setSelectedAdmission}>
                <SelectTrigger>
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
      </div>

      {selectedAdmission && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Charges</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalCharges)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <BedDouble className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Room Charges</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(roomCharges.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Receipt className="h-8 w-8 text-muted-foreground" />
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
                      <TableHead className="text-center">Status</TableHead>
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
                          <Badge 
                            variant={
                              charge.charge_type === "room" ? "default" :
                              charge.charge_type === "medication" ? "secondary" :
                              "outline"
                            } 
                            className="capitalize"
                          >
                            {charge.charge_type || "service"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{charge.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(charge.unit_price || 0)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(charge.total_amount || 0)}
                        </TableCell>
                        <TableCell className="text-center">
                          {charge.is_billed ? (
                            <Badge variant="secondary">Billed</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={5} className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(totalCharges)}
                      </TableCell>
                      <TableCell />
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
                placeholder="e.g., Nursing Care, Procedure, Lab Test"
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

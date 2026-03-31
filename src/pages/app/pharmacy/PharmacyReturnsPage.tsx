import { useState } from "react";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw, Search, Receipt, Package, AlertCircle, CheckCircle2, Loader2, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/currency";
import {
  useSearchTransactionForReturn,
  useSearchDispensedPrescriptions,
  useRecentReturns,
  useReturnsStats,
  useProcessReturn,
  DispensedPrescriptionResult,
} from "@/hooks/usePharmacyReturns";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReturnItemSelector, SelectedReturnItem } from "@/components/pharmacy/ReturnItemSelector";
import { RefundMethodSelector, RefundMethod } from "@/components/pharmacy/RefundMethodSelector";

export default function PharmacyReturnsPage() {
  const { profile } = useAuth();
  const [searchMode, setSearchMode] = useState<"pos" | "prescription">("pos");
  const [searchQuery, setSearchQuery] = useState("");
  const [rxSearchQuery, setRxSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<DispensedPrescriptionResult | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedReturnItem[]>([]);
  const [refundMethod, setRefundMethod] = useState<RefundMethod>("cash_refund");

  const firstName = profile?.full_name?.split(" ")[0] || "User";
  
  const { data: searchResults, isLoading: searchLoading } = useSearchTransactionForReturn(
    searchMode === "pos" ? searchQuery : ""
  );
  const { data: rxResults, isLoading: rxSearchLoading } = useSearchDispensedPrescriptions(
    searchMode === "prescription" ? rxSearchQuery : ""
  );
  const { data: recentReturns, isLoading: returnsLoading } = useRecentReturns();
  const { data: stats } = useReturnsStats();
  const processReturnMutation = useProcessReturn();

  const handleSelectTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setSelectedPrescription(null);
    setSelectedItems([]);
    setRefundMethod("cash_refund");
    setReturnReason("");
    setShowReturnDialog(true);
  };

  const handleSelectPrescription = (rx: DispensedPrescriptionResult) => {
    setSelectedPrescription(rx);
    setSelectedTransaction(null);
    setSelectedItems([]);
    setRefundMethod("cash_refund");
    setReturnReason("");
    setShowReturnDialog(true);
  };

  const handleProcessReturn = () => {
    if (!returnReason.trim() || selectedItems.length === 0) return;
    
    const totalRefund = selectedItems.reduce((sum, item) => sum + item.line_total, 0);
    
    processReturnMutation.mutate({
      transactionId: selectedTransaction?.id,
      prescriptionId: selectedPrescription?.id,
      reason: returnReason,
      selectedItems,
      refundMethod,
      totalRefundAmount: totalRefund,
      restockItems: true,
    }, {
      onSuccess: () => {
        setShowReturnDialog(false);
        setSelectedTransaction(null);
        setSelectedPrescription(null);
        setReturnReason("");
        setSelectedItems([]);
        setRefundMethod("cash_refund");
        setSearchQuery("");
        setRxSearchQuery("");
      },
    });
  };
  
  const totalRefundAmount = selectedItems.reduce((sum, item) => sum + item.line_total, 0);

  const dialogItems = selectedTransaction?.items
    ? selectedTransaction.items.map((item: any) => ({
        id: item.id,
        medicine_name: item.medicine_name,
        medicine_id: item.medicine_id,
        inventory_id: item.inventory_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        batch_number: item.batch_number,
      }))
    : selectedPrescription?.items
    ? selectedPrescription.items.map(item => ({
        id: item.id,
        medicine_name: item.medicine_name,
        medicine_id: item.medicine_id,
        inventory_id: item.inventory_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        batch_number: item.batch_number,
      }))
    : [];

  

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="Returns & Refunds"
        userName={firstName}
        showGreeting
        icon={RotateCcw}
        iconColor="warning"
        quickStats={[
          { label: "Today's Returns", value: stats?.todayReturns || 0 },
          { label: "Restocked", value: stats?.itemsRestocked || 0 },
          { label: "This Week", value: recentReturns?.length || 0 },
        ]}
      />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <ModernStatsCard
          title="Today's Returns"
          value={stats?.todayReturns || 0}
          icon={RotateCcw}
          variant="warning"
          description="Processed today"
        />
        <ModernStatsCard
          title="Items Restocked"
          value={stats?.itemsRestocked || 0}
          icon={Package}
          variant="default"
          description="Back to inventory"
        />
        <ModernStatsCard
          title="Total Refunded"
          value={formatCurrency(stats?.weeklyRefundTotal || 0)}
          icon={Receipt}
          variant="info"
          description="This week"
        />
        <ModernStatsCard
          title="Pending Approval"
          value={stats?.pendingApproval || 0}
          icon={AlertCircle}
          variant="destructive"
          description="Awaiting review"
        />
      </div>

      {/* Search for Transaction / Prescription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            Find Transaction or Prescription
          </CardTitle>
          <CardDescription>
            Search by receipt number, patient name/MRN, or prescription number to process a return
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as "pos" | "prescription")}>
            <TabsList>
              <TabsTrigger value="pos" className="gap-2">
                <Receipt className="h-4 w-4" />
                POS Transaction
              </TabsTrigger>
              <TabsTrigger value="prescription" className="gap-2">
                <FileText className="h-4 w-4" />
                Prescription (OPD/IPD)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pos" className="mt-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter Receipt #, Customer Name, or Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button className="gap-2" disabled={searchLoading}>
                  {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Search
                </Button>
              </div>

              {searchQuery.length >= 3 && (
                <div className="border rounded-lg mt-3">
                  {searchLoading ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                      Searching...
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <ScrollArea className="max-h-64">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Receipt #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {searchResults.map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell className="font-mono font-medium">{tx.transaction_number}</TableCell>
                              <TableCell>{tx.customer_name || "Walk-in"}</TableCell>
                              <TableCell>{format(new Date(tx.created_at), "dd MMM yyyy HH:mm")}</TableCell>
                              <TableCell>{tx.items?.length || 0} items</TableCell>
                              <TableCell className="font-semibold">{formatCurrency(tx.total_amount)}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => handleSelectTransaction(tx)}>
                                  Process Return
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No transactions found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="prescription" className="mt-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter Patient Name, MRN, or Prescription #..."
                  value={rxSearchQuery}
                  onChange={(e) => setRxSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button className="gap-2" disabled={rxSearchLoading}>
                  {rxSearchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Search
                </Button>
              </div>

              {rxSearchQuery.length >= 3 && (
                <div className="border rounded-lg mt-3">
                  {rxSearchLoading ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                      Searching prescriptions...
                    </div>
                  ) : rxResults && rxResults.length > 0 ? (
                    <ScrollArea className="max-h-64">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rx #</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>MRN</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Dispensed</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rxResults.map((rx) => (
                            <TableRow key={rx.id}>
                              <TableCell className="font-mono font-medium">{rx.prescription_number}</TableCell>
                              <TableCell>{rx.patient_name}</TableCell>
                              <TableCell className="font-mono text-sm">{rx.patient_mrn}</TableCell>
                              <TableCell>
                                <Badge variant={rx.source === "ipd" ? "default" : "secondary"}>
                                  {rx.source.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell>{rx.dispensed_at ? format(new Date(rx.dispensed_at), "dd MMM yyyy") : "-"}</TableCell>
                              <TableCell>{rx.items.length} items</TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => handleSelectPrescription(rx)}>
                                  Process Return
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No dispensed prescriptions found matching "{rxSearchQuery}"
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Returns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Returns</CardTitle>
          <CardDescription>Latest return transactions processed</CardDescription>
        </CardHeader>
        <CardContent>
          {returnsLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            </div>
          ) : recentReturns && recentReturns.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Refund Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReturns.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-medium">{item.return_number}</TableCell>
                    <TableCell>{item.created_at ? format(new Date(item.created_at), "dd MMM yyyy") : "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.return_type === "cash_refund" ? "Cash" : item.return_type === "add_credit" ? "Credit" : item.return_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.items_count || 0} ({item.items_restocked || 0} restocked)</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(item.total_refund_amount)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{item.reason || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No returns processed yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Processing Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Process Return</DialogTitle>
            <DialogDescription>
              {selectedPrescription
                ? `Prescription return for ${selectedPrescription.patient_name} (${selectedPrescription.source.toUpperCase()})`
                : "Review transaction details and confirm the return/refund"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg space-y-2">
              {selectedTransaction && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Receipt #</span>
                    <span className="font-mono font-medium">{selectedTransaction.transaction_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Customer</span>
                    <span>{selectedTransaction.customer_name || "Walk-in"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Amount</span>
                    <span className="font-semibold">{formatCurrency(selectedTransaction.total_amount)}</span>
                  </div>
                </>
              )}
              {selectedPrescription && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Prescription #</span>
                    <span className="font-mono font-medium">{selectedPrescription.prescription_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Patient</span>
                    <span>{selectedPrescription.patient_name} ({selectedPrescription.patient_mrn})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Source</span>
                    <Badge variant={selectedPrescription.source === "ipd" ? "default" : "secondary"}>
                      {selectedPrescription.source.toUpperCase()}
                    </Badge>
                  </div>
                </>
              )}
            </div>

            {dialogItems.length > 0 ? (
              <ReturnItemSelector
                items={dialogItems}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
              />
            ) : (
              <div className="p-4 text-center border rounded-lg">
                <AlertCircle className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No returnable items found for this {selectedPrescription ? "prescription" : "transaction"}.
                  {selectedPrescription && " Price information may be unavailable."}
                </p>
              </div>
            )}

            <RefundMethodSelector
              value={refundMethod}
              onChange={setRefundMethod}
              refundAmount={totalRefundAmount}
              patientName={selectedTransaction?.customer_name || selectedPrescription?.patient_name}
            />

            <div>
              <label className="text-sm font-medium">Return Reason *</label>
              <Textarea
                placeholder="Enter reason for return..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleProcessReturn}
              disabled={!returnReason.trim() || selectedItems.length === 0 || processReturnMutation.isPending}
            >
              {processReturnMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Return ${selectedItems.length} Item${selectedItems.length !== 1 ? 's' : ''} - ${formatCurrency(totalRefundAmount)}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

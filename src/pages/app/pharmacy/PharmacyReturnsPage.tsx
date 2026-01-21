import { useState } from "react";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw, Search, Receipt, Package, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { formatCurrency } from "@/lib/currency";
import { useSearchTransactionForReturn, useRecentReturns, useReturnsStats, useProcessReturn } from "@/hooks/usePharmacyReturns";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PharmacyReturnsPage() {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [returnReason, setReturnReason] = useState("");
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  const firstName = profile?.full_name?.split(" ")[0] || "User";
  
  const { data: searchResults, isLoading: searchLoading } = useSearchTransactionForReturn(searchQuery);
  const { data: recentReturns, isLoading: returnsLoading } = useRecentReturns();
  const { data: stats } = useReturnsStats();
  const processReturnMutation = useProcessReturn();

  const handleSearch = () => {
    // Search is triggered automatically by the hook
  };

  const handleSelectTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowReturnDialog(true);
  };

  const handleProcessReturn = () => {
    if (!selectedTransaction || !returnReason.trim()) return;
    
    processReturnMutation.mutate({
      transactionId: selectedTransaction.id,
      reason: returnReason,
      restockItems: true,
    }, {
      onSuccess: () => {
        setShowReturnDialog(false);
        setSelectedTransaction(null);
        setReturnReason("");
        setSearchQuery("");
      },
    });
  };

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
          { label: "Pending", value: stats?.pendingApproval || 0, variant: "warning" },
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
          title="Pending Approval"
          value={stats?.pendingApproval || 0}
          icon={AlertCircle}
          variant="destructive"
          description="Awaiting review"
        />
        <ModernStatsCard
          title="Total Refunded"
          value={formatCurrency(stats?.weeklyRefundTotal || 0)}
          icon={Receipt}
          variant="info"
          description="This week"
        />
        <ModernStatsCard
          title="Items Returned"
          value={stats?.itemsRestocked || 0}
          icon={Package}
          variant="default"
          description="Back to stock"
        />
      </div>

      {/* Search for Transaction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            Find Transaction
          </CardTitle>
          <CardDescription>
            Search by receipt number, patient name, or phone number to process a return
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Enter Receipt #, Customer Name, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button className="gap-2" onClick={handleSearch} disabled={searchLoading}>
              {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>

          {/* Search Results */}
          {searchQuery.length >= 3 && (
            <div className="border rounded-lg">
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
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSelectTransaction(tx)}
                            >
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
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Refund Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReturns.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-medium">{item.transaction_number}</TableCell>
                    <TableCell>{item.voided_at ? format(new Date(item.voided_at), "dd MMM yyyy") : "-"}</TableCell>
                    <TableCell>{item.customer_name || "Walk-in"}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(item.total_amount)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{item.void_reason || "-"}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="default"
                        className="bg-green-500/10 text-green-600 border-green-500/20"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {item.status === "refunded" ? "Refunded" : "Voided"}
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
              Review transaction details and confirm the return/refund
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg space-y-2">
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
              </div>

              {selectedTransaction.items && selectedTransaction.items.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Items ({selectedTransaction.items.length})</p>
                  <ScrollArea className="max-h-32">
                    <div className="space-y-1">
                      {selectedTransaction.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                          <span>{item.medicine_name} x{item.quantity}</span>
                          <span>{formatCurrency(item.total_price)}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

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
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleProcessReturn}
              disabled={!returnReason.trim() || processReturnMutation.isPending}
            >
              {processReturnMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Return"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
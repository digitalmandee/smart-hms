import { useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { POStatusBadge } from "@/components/inventory/POStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Edit,
  Building2,
  Phone,
  Mail,
  MapPin,
  Star,
  ShoppingCart,
  User,
  CreditCard,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";
import { useVendor, useVendorPurchaseHistory } from "@/hooks/useVendors";
import { useVendorOutstandingBalance, useVendorPaymentsByVendor } from "@/hooks/useVendorPayments";
import { VendorDocuments } from "@/components/inventory/VendorDocuments";
import { format, differenceInDays } from "date-fns";

export default function VendorDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { formatCurrency } = useCurrencyFormatter();
  const { data: vendor, isLoading } = useVendor(id || "");
  const { data: purchaseHistory } = useVendorPurchaseHistory(id || "");
  const { data: outstanding } = useVendorOutstandingBalance(id || "");
  const { data: vendorPayments } = useVendorPaymentsByVendor(id || "");

  // Aging breakdown
  const aging = useMemo(() => {
    if (!outstanding?.outstandingItems) return { d0_30: 0, d31_60: 0, d61_90: 0, d90plus: 0 };
    const now = new Date();
    return outstanding.outstandingItems.reduce(
      (acc, item) => {
        const days = differenceInDays(now, new Date(item.received_date));
        if (days <= 30) acc.d0_30 += item.outstanding;
        else if (days <= 60) acc.d31_60 += item.outstanding;
        else if (days <= 90) acc.d61_90 += item.outstanding;
        else acc.d90plus += item.outstanding;
        return acc;
      },
      { d0_30: 0, d31_60: 0, d61_90: 0, d90plus: 0 }
    );
  }, [outstanding?.outstandingItems]);

  // Split POs into active vs completed
  const activePOs = useMemo(
    () => purchaseHistory?.filter((po) => ["draft", "pending", "approved", "ordered"].includes(po.status)) || [],
    [purchaseHistory]
  );
  const completedPOs = useMemo(
    () => purchaseHistory?.filter((po) => ["received", "completed", "cancelled"].includes(po.status)) || [],
    [purchaseHistory]
  );

  const renderRating = (rating: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">({rating}/5)</span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Vendor not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/app/inventory/vendors")}>
          Back to Vendors
        </Button>
      </div>
    );
  }

  const totalPOValue = purchaseHistory?.reduce((sum, po) => sum + (po.total_amount || 0), 0) || 0;
  const poCount = purchaseHistory?.length || 0;

  return (
    <div className="space-y-6">
      <PageHeader title={vendor.name} description={`${vendor.vendor_code} • Vendor Profile`} />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate("/app/inventory/vendors")}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>
        <Button onClick={() => navigate(`/app/inventory/vendors/${id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />Edit Vendor
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/app/inventory/purchase-orders/new?vendor_id=${id}`)}>
          <ShoppingCart className="mr-2 h-4 w-4" />Create PO
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{poCount}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{formatCurrency(totalPOValue)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payment Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{vendor.payment_terms || "—"}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
          </CardHeader>
          <CardContent>{renderRating(vendor.rating || 0)}</CardContent>
        </Card>
      </div>

      {/* Outstanding Balance Card */}
      {outstanding && (
        <Card className={outstanding.outstanding > 0 ? "border-amber-200" : "border-emerald-200"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Outstanding Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Payable</p>
                <p className="text-xl font-bold">{formatCurrency(outstanding.totalPayable)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(outstanding.totalPaid)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(outstanding.outstanding)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credit Balance</p>
                <p className="text-xl font-bold text-blue-600">
                  {outstanding.outstanding < 0 ? formatCurrency(Math.abs(outstanding.outstanding)) : formatCurrency(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aging Summary */}
      {outstanding && outstanding.outstanding > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Aging Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm text-muted-foreground">0-30 Days</p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(aging.d0_30)}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-muted-foreground">31-60 Days</p>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{formatCurrency(aging.d31_60)}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-muted-foreground">61-90 Days</p>
                <p className="text-lg font-bold text-orange-700 dark:text-orange-300">{formatCurrency(aging.d61_90)}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  90+ Days {aging.d90plus > 0 && <AlertTriangle className="h-3 w-3 text-destructive" />}
                </p>
                <p className="text-lg font-bold text-red-700 dark:text-red-300">{formatCurrency(aging.d90plus)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact & Financial Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p className="font-medium">{vendor.contact_person || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{vendor.phone || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{vendor.email || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {[vendor.address, vendor.city, vendor.country].filter(Boolean).join(", ") || "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />Financial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tax Number</p>
                <p className="font-medium">{vendor.tax_number || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bank Account</p>
                <p className="font-medium">{vendor.bank_details?.account_number || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bank Name</p>
                <p className="font-medium">{vendor.bank_details?.bank_name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Terms</p>
                <p className="font-medium">{vendor.payment_terms || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={vendor.is_active ? "default" : "secondary"}>
                  {vendor.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            {vendor.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="mt-1">{vendor.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vendorPayments && vendorPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>GRN Ref</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorPayments.map((payment) => (
                  <TableRow key={payment.id} className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/app/accounts/vendor-payments/${payment.id}`)}>
                    <TableCell className="font-medium">{payment.payment_number}</TableCell>
                    <TableCell>{format(new Date(payment.payment_date), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{payment.grn?.grn_number || "—"}</TableCell>
                    <TableCell>{payment.payment_method?.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === "paid" ? "default" : payment.status === "cancelled" ? "destructive" : "secondary"}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(payment.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No payments recorded for this vendor</p>
          )}
        </CardContent>
      </Card>

      {/* Active Purchase Orders */}
      {activePOs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />Active Purchase Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activePOs.map((po) => (
                  <TableRow key={po.id} className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/app/inventory/purchase-orders/${po.id}`)}>
                    <TableCell className="font-medium">{po.po_number}</TableCell>
                    <TableCell>{format(new Date(po.order_date), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{po.branch?.name || "—"}</TableCell>
                    <TableCell><POStatusBadge status={po.status} /></TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(po.total_amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Completed Purchase Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />Purchase Order History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedPOs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedPOs.map((po) => (
                  <TableRow key={po.id} className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/app/inventory/purchase-orders/${po.id}`)}>
                    <TableCell className="font-medium">{po.po_number}</TableCell>
                    <TableCell>{format(new Date(po.order_date), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{po.branch?.name || "—"}</TableCell>
                    <TableCell><POStatusBadge status={po.status} /></TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(po.total_amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No completed purchase orders</p>
          )}
        </CardContent>
      </Card>

      {/* Vendor Documents */}
      <VendorDocuments vendorId={id || ""} />
    </div>
  );
}

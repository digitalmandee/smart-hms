import { useNavigate, useParams } from "react-router-dom";
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
} from "lucide-react";
import { useVendor, useVendorPurchaseHistory } from "@/hooks/useVendors";
import { format } from "date-fns";

export default function VendorDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: vendor, isLoading } = useVendor(id || "");
  const { data: purchaseHistory } = useVendorPurchaseHistory(id || "");

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({rating}/5)</span>
      </div>
    );
  };

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
      <PageHeader
        title={vendor.vendor_name}
        description={`${vendor.vendor_code} • Vendor Profile`}
      />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate("/app/inventory/vendors")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={() => navigate(`/app/inventory/vendors/${id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Vendor
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(`/app/inventory/purchase-orders/new?vendorId=${id}`)}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Create PO
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{poCount}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              Rs. {totalPOValue.toLocaleString()}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{vendor.payment_terms || 0}</span>
            <span className="text-muted-foreground ml-1">days</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderRating(vendor.rating || 0)}
          </CardContent>
        </Card>
      </div>

      {/* Vendor Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Contact Information
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
              <CreditCard className="h-5 w-5" />
              Financial Details
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
                <p className="font-medium">{vendor.bank_account || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bank Name</p>
                <p className="font-medium">{vendor.bank_name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credit Limit</p>
                <p className="font-medium">
                  {vendor.credit_limit
                    ? `Rs. ${vendor.credit_limit.toLocaleString()}`
                    : "—"}
                </p>
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

      {/* Purchase Order History */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Order History</CardTitle>
        </CardHeader>
        <CardContent>
          {purchaseHistory && purchaseHistory.length > 0 ? (
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
                {purchaseHistory.map((po) => (
                  <TableRow
                    key={po.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/app/inventory/purchase-orders/${po.id}`)}
                  >
                    <TableCell className="font-medium">{po.po_number}</TableCell>
                    <TableCell>
                      {format(new Date(po.po_date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>{po.branch?.branch_name || "—"}</TableCell>
                    <TableCell>
                      <POStatusBadge status={po.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rs. {po.total_amount?.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No purchase orders found for this vendor
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

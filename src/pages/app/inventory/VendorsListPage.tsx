import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Search, Building, Star } from "lucide-react";
import { useVendors } from "@/hooks/useVendors";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";

const VENDOR_TYPE_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pharmaceutical: { label: "Pharmaceutical", variant: "default" },
  equipment: { label: "Equipment", variant: "secondary" },
  consumables: { label: "Consumables", variant: "outline" },
  surgical: { label: "Surgical", variant: "default" },
  services: { label: "Services", variant: "secondary" },
  general: { label: "General", variant: "outline" },
};

export default function VendorsListPage() {
  const [search, setSearch] = useState("");
  const { data: vendors, isLoading } = useVendors(search);

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        description="Manage your suppliers and vendors"
        actions={
          <Button asChild>
            <Link to="/app/inventory/vendors/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : vendors?.length === 0 ? (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No vendors found</h3>
              <p className="text-muted-foreground">
                {search ? "Try a different search term" : "Add your first vendor"}
              </p>
              <Button asChild className="mt-4">
                <Link to="/app/inventory/vendors/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vendor
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors?.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <Link
                        to={`/app/inventory/vendors/${vendor.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {vendor.vendor_code}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium">{vendor.name}</p>
                          {vendor.contact_person && (
                            <p className="text-xs text-muted-foreground">
                              {vendor.contact_person}
                            </p>
                          )}
                        </div>
                        {(vendor as any).is_preferred && (
                          <Star className="h-4 w-4 text-warning fill-warning" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const typeInfo = VENDOR_TYPE_LABELS[(vendor as any).vendor_type || 'general'];
                        return (
                          <Badge variant={typeInfo?.variant || "outline"}>
                            {typeInfo?.label || "General"}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {vendor.phone && <p>{vendor.phone}</p>}
                        {vendor.email && (
                          <p className="text-muted-foreground">{vendor.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{vendor.city || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{vendor.payment_terms}</Badge>
                    </TableCell>
                    <TableCell>{renderRating(vendor.rating)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAllStores, useToggleStoreActive, useStoreContext } from "@/hooks/useStores";
import { Plus, Search, MoreHorizontal, Edit, Power, ArrowLeft, Warehouse } from "lucide-react";
import { format } from "date-fns";

const storeTypeLabels: Record<string, string> = {
  central: "Central",
  medical: "Medical",
  surgical: "Surgical",
  dental: "Dental",
  equipment: "Equipment",
  pharmacy: "Pharmacy",
  general: "General",
  distribution: "Distribution",
  cold_storage: "Cold Storage",
  bulk: "Bulk Storage",
};

const storeTypeVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  central: "default",
  medical: "secondary",
  surgical: "secondary",
  pharmacy: "secondary",
  equipment: "outline",
  dental: "outline",
  general: "outline",
};

export default function StoresListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const storeContext = useStoreContext();
  const { data: stores, isLoading } = useAllStores(storeContext);
  const toggleActive = useToggleStoreActive();

  const filtered = stores?.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code?.toLowerCase().includes(search.toLowerCase()) ||
      s.branch?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouse Management"
        description="Create and manage warehouses for your organization"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/inventory")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => navigate("/app/inventory/stores/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Warehouse
            </Button>
          </div>
        }
      />

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, code, or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warehouse</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading warehouses...
                  </TableCell>
                </TableRow>
              ) : !filtered?.length ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Warehouse className="h-8 w-8" />
                      <p>No warehouses found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/app/inventory/stores/new")}
                      >
                        Create your first warehouse
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((store) => (
                  <TableRow key={store.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{store.name}</p>
                          {store.description && (
                            <p className="text-xs text-muted-foreground">{store.description}</p>
                          )}
                        </div>
                        {store.is_central && (
                          <Badge variant="default" className="text-xs">
                            Central
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{store.code || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={storeTypeVariants[store.store_type] || "outline"}>
                        {storeTypeLabels[store.store_type] || store.store_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{store.branch?.name || "-"}</TableCell>
                    <TableCell>{store.manager?.full_name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={store.is_active ? "default" : "destructive"}>
                        {store.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(store.created_at), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/app/inventory/stores/${store.id}/edit`)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {!store.is_central && (
                            <DropdownMenuItem
                              onClick={() =>
                                toggleActive.mutate({
                                  id: store.id,
                                  is_active: !store.is_active,
                                })
                              }
                            >
                              <Power className="mr-2 h-4 w-4" />
                              {store.is_active ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

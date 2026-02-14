import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStores, useToggleStoreActive, Store } from "@/hooks/useStores";
import { Plus, Warehouse, Settings, LayoutGrid, Power } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function WarehousesListPage() {
  const navigate = useNavigate();
  const { data: stores, isLoading } = useStores(undefined, "pharmacy");
  const toggleActive = useToggleStoreActive();
  const [toggleTarget, setToggleTarget] = useState<Store | null>(null);

  const columns: ColumnDef<Store>[] = [
    {
      accessorKey: "name",
      header: "Warehouse",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Warehouse className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{row.original.name}</p>
            {row.original.code && <p className="text-xs text-muted-foreground">{row.original.code}</p>}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "store_type",
      header: "Type",
      cell: ({ row }) => <Badge variant="outline">{row.original.store_type}</Badge>,
    },
    {
      accessorKey: "branch",
      header: "Branch",
      cell: ({ row }) => row.original.branch?.name || "—",
    },
    {
      accessorKey: "is_central",
      header: "Central",
      cell: ({ row }) => row.original.is_central ? <Badge>Central</Badge> : "—",
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/app/pharmacy/warehouses/${row.original.id}`)}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/app/pharmacy/warehouses/${row.original.id}/racks`)}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setToggleTarget(row.original)}>
            <Power className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmacy Warehouses"
        description="Manage your pharmacy storage locations"
        actions={
          <Button onClick={() => navigate("/app/pharmacy/warehouses/new")}>
            <Plus className="mr-2 h-4 w-4" /> New Warehouse
          </Button>
        }
      />
      <DataTable columns={columns} data={stores || []} isLoading={isLoading} />

      <AlertDialog open={!!toggleTarget} onOpenChange={() => setToggleTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleTarget?.is_active ? "Deactivate" : "Activate"} Warehouse?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleTarget?.is_active
                ? "This will hide the warehouse from active selections."
                : "This will make the warehouse available again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toggleTarget) {
                  toggleActive.mutate({ id: toggleTarget.id, is_active: !toggleTarget.is_active });
                  setToggleTarget(null);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

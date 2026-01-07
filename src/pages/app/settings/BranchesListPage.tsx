import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, MapPin, Phone, Mail, ArrowUpDown } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useBranches, useUpdateBranch, useDeleteBranch } from "@/hooks/useBranches";
import { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";

type Branch = Database["public"]["Tables"]["branches"]["Row"];

export function BranchesListPage() {
  const navigate = useNavigate();
  const { data: branches, isLoading } = useBranches();
  const updateBranch = useUpdateBranch();
  const deleteBranch = useDeleteBranch();

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    updateBranch.mutate({ id, data: { is_active: !currentStatus } });
  };

  const columns: ColumnDef<Branch>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Branch
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.code}</p>
          </div>
          {row.original.is_main_branch && (
            <Badge variant="secondary" className="text-xs">Main</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "city",
      header: "Location",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          {row.original.city || row.original.address || "-"}
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Contact",
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          {row.original.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-muted-foreground" />
              {row.original.phone}
            </div>
          )}
          {row.original.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 text-muted-foreground" />
              {row.original.email}
            </div>
          )}
          {!row.original.phone && !row.original.email && "-"}
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.is_active ? "active" : "inactive"} />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/app/settings/branches/${row.original.id}`)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleActive(row.original.id, row.original.is_active || false)}>
              {row.original.is_active ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Branches"
        description="Manage your organization's branches"
        breadcrumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "Branches" },
        ]}
        actions={
          <Link to="/app/settings/branches/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Branch
            </Button>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={branches || []}
        searchKey="name"
        searchPlaceholder="Search branches..."
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/app/settings/branches/${row.id}`)}
      />
    </div>
  );
}

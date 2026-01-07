import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, ArrowUpDown } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useUsers, useUpdateUser, UserWithRoles } from "@/hooks/useUsers";
import { useBranches } from "@/hooks/useBranches";
import { format } from "date-fns";

export function UsersListPage() {
  const navigate = useNavigate();
  const { data: users, isLoading } = useUsers();
  const { data: branches } = useBranches();
  const updateUser = useUpdateUser();

  const getBranchName = (branchId: string | null) => {
    if (!branchId || !branches) return "-";
    const branch = branches.find((b) => b.id === branchId);
    return branch?.name || "-";
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    updateUser.mutate({ id, data: { is_active: !currentStatus } });
  };

  const columns: ColumnDef<UserWithRoles>[] = [
    {
      accessorKey: "full_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.full_name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email || "-"}</p>
        </div>
      ),
    },
    {
      accessorKey: "roles",
      header: "Roles",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.length > 0 ? (
            row.original.roles.map((role) => (
              <Badge key={role} variant="secondary" className="text-xs capitalize">
                {role.replace(/_/g, " ")}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-xs">No roles</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "branch_id",
      header: "Branch",
      cell: ({ row }) => getBranchName(row.original.branch_id),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.is_active ? "active" : "inactive"} />
      ),
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => format(new Date(row.original.created_at), "MMM dd, yyyy"),
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
            <DropdownMenuItem onClick={() => navigate(`/app/settings/users/${row.original.id}`)}>
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
        title="Users"
        description="Manage your organization's users and their roles"
        breadcrumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "Users" },
        ]}
        actions={
          <Button onClick={() => navigate("/app/settings/users/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={users || []}
        searchKey="full_name"
        searchPlaceholder="Search users..."
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/app/settings/users/${row.id}`)}
      />
    </div>
  );
}

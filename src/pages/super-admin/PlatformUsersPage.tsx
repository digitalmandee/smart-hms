import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { useAllUsers } from "@/hooks/useUsers";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithOrg {
  id: string;
  full_name: string;
  email: string | null;
  is_active: boolean | null;
  created_at: string;
  organization_id: string | null;
  organizations: { name: string } | null;
  roles: AppRole[];
}

export function PlatformUsersPage() {
  const navigate = useNavigate();
  const { data: users, isLoading } = useAllUsers();

  const columns: ColumnDef<UserWithOrg>[] = [
    {
      accessorKey: "full_name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.full_name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email || "-"}</p>
        </div>
      ),
    },
    {
      accessorKey: "organizations",
      header: "Organization",
      cell: ({ row }) => row.original.organizations?.name || "-",
    },
    {
      accessorKey: "roles",
      header: "Roles",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.length > 0 ? (
            row.original.roles.map((role) => (
              <Badge key={role} variant="secondary" className="text-xs">
                {role.replace("_", " ")}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-xs">No roles</span>
          )}
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
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => format(new Date(row.original.created_at), "MMM dd, yyyy"),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Platform Users"
        description="View all users across all organizations"
        breadcrumbs={[
          { label: "Super Admin", href: "/super-admin/dashboard" },
          { label: "Users" },
        ]}
      />

      <DataTable
        columns={columns}
        data={(users as UserWithOrg[]) || []}
        searchKey="full_name"
        searchPlaceholder="Search users..."
        isLoading={isLoading}
      />
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, Building2, ArrowUpDown } from "lucide-react";
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
import { useOrganizations, useUpdateOrganization } from "@/hooks/useOrganizations";
import { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

export function OrganizationsListPage() {
  const navigate = useNavigate();
  const { data: organizations, isLoading } = useOrganizations();
  const updateOrg = useUpdateOrganization();

  const handleStatusChange = (id: string, status: "active" | "suspended" | "trial") => {
    updateOrg.mutate({ id, data: { subscription_status: status } });
  };

  const columns: ColumnDef<Organization>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Organization
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Contact",
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{row.original.email || "-"}</p>
          <p className="text-xs text-muted-foreground">{row.original.phone || ""}</p>
        </div>
      ),
    },
    {
      accessorKey: "subscription_plan",
      header: "Plan",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.subscription_plan || "basic"}</span>
      ),
    },
    {
      accessorKey: "subscription_status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.subscription_status || "trial"} />
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
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
            <DropdownMenuItem onClick={() => navigate(`/super-admin/organizations/${row.original.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "active")}>
              Set Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "suspended")}>
              Suspend
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Manage all organizations on the platform"
        breadcrumbs={[
          { label: "Super Admin", href: "/super-admin/dashboard" },
          { label: "Organizations" },
        ]}
        actions={
          <Link to="/super-admin/organizations/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Organization
            </Button>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={organizations || []}
        searchKey="name"
        searchPlaceholder="Search organizations..."
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/super-admin/organizations/${row.id}`)}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Shield, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from "@/integrations/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AppRole = Database["public"]["Enums"]["app_role"];

interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
}

interface RolePermission {
  role: AppRole;
  permission_id: string;
  is_granted: boolean;
}

const EDITABLE_ROLES: AppRole[] = [
  "org_admin",
  "branch_admin",
  "doctor",
  "nurse",
  "receptionist",
  "pharmacist",
  "lab_technician",
  "accountant",
];

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  org_admin: "Org Admin",
  branch_admin: "Branch Admin",
  doctor: "Doctor",
  nurse: "Nurse",
  receptionist: "Receptionist",
  pharmacist: "Pharmacist",
  lab_technician: "Lab Tech",
  accountant: "Accountant",
  hr_manager: "HR Manager",
  hr_officer: "HR Officer",
  store_manager: "Store Manager",
  finance_manager: "Finance Manager",
  blood_bank_technician: "Blood Bank Tech",
  radiologist: "Radiologist",
  radiology_technician: "Radiology Tech",
  ipd_nurse: "IPD Nurse",
  ot_technician: "OT Technician",
};

export function RolesPermissionsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchData();
  }, [profile?.organization_id]);

  const fetchData = async () => {
    try {
      // Fetch all permissions
      const { data: perms, error: permsError } = await supabase
        .from("permissions")
        .select("*")
        .order("module", { ascending: true })
        .order("name", { ascending: true });

      if (permsError) throw permsError;
      setPermissions(perms || []);

      // Fetch role permissions (both global and org-specific)
      const { data: rp, error: rpError } = await supabase
        .from("role_permissions")
        .select("*")
        .or(`organization_id.is.null,organization_id.eq.${profile?.organization_id}`);

      if (rpError) throw rpError;

      // Build the state - org-specific overrides global
      const permMap = new Map<string, RolePermission>();
      (rp || []).forEach((r) => {
        const key = `${r.role}-${r.permission_id}`;
        // Org-specific takes precedence over global
        if (!permMap.has(key) || r.organization_id) {
          permMap.set(key, {
            role: r.role,
            permission_id: r.permission_id,
            is_granted: r.is_granted ?? true,
          });
        }
      });

      setRolePermissions(Array.from(permMap.values()));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isGranted = (role: AppRole, permissionId: string): boolean => {
    const rp = rolePermissions.find(
      (r) => r.role === role && r.permission_id === permissionId
    );
    return rp?.is_granted ?? false;
  };

  const togglePermission = (role: AppRole, permissionId: string) => {
    const key = `${role}-${permissionId}`;
    const existing = rolePermissions.find(
      (r) => r.role === role && r.permission_id === permissionId
    );

    if (existing) {
      setRolePermissions(
        rolePermissions.map((r) =>
          r.role === role && r.permission_id === permissionId
            ? { ...r, is_granted: !r.is_granted }
            : r
        )
      );
    } else {
      setRolePermissions([
        ...rolePermissions,
        { role, permission_id: permissionId, is_granted: true },
      ]);
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!profile?.organization_id) return;

    setIsSaving(true);
    try {
      // Delete existing org-specific permissions
      await supabase
        .from("role_permissions")
        .delete()
        .eq("organization_id", profile.organization_id);

      // Insert new permissions
      const toInsert = rolePermissions
        .filter((rp) => EDITABLE_ROLES.includes(rp.role))
        .map((rp) => ({
          role: rp.role,
          permission_id: rp.permission_id,
          is_granted: rp.is_granted,
          organization_id: profile.organization_id,
        }));

      if (toInsert.length > 0) {
        const { error } = await supabase.from("role_permissions").insert(toInsert);
        if (error) throw error;
      }

      toast({
        title: "Saved",
        description: "Role permissions have been updated",
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Error",
        description: "Failed to save permissions",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Roles & Permissions"
          breadcrumbs={[
            { label: "Settings", href: "/app/settings" },
            { label: "Roles & Permissions" },
          ]}
        />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Customize what each role can access in your organization"
        breadcrumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "Roles & Permissions" },
        ]}
        actions={
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permission Matrix
          </CardTitle>
          <CardDescription>
            Check the boxes to grant permissions to each role
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Permission</TableHead>
                {EDITABLE_ROLES.map((role) => (
                  <TableHead key={role} className="text-center min-w-[100px]">
                    {ROLE_LABELS[role]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedPermissions).map(([module, perms]) => (
                <>
                  <TableRow key={module} className="bg-muted/50">
                    <TableCell colSpan={EDITABLE_ROLES.length + 1} className="font-semibold capitalize">
                      {module}
                    </TableCell>
                  </TableRow>
                  {perms.map((perm) => (
                    <TableRow key={perm.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{perm.name}</p>
                          <p className="text-xs text-muted-foreground">{perm.code}</p>
                        </div>
                      </TableCell>
                      {EDITABLE_ROLES.map((role) => (
                        <TableCell key={role} className="text-center">
                          <Checkbox
                            checked={isGranted(role, perm.id)}
                            onCheckedChange={() => togglePermission(role, perm.id)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

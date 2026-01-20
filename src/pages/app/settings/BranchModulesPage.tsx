import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Puzzle, Building2, Info, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ModuleWithStatus {
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  is_core: boolean;
  is_hospital_only: boolean;
  org_enabled: boolean;
  branch_enabled: boolean;
  branch_override: boolean; // Whether branch has its own setting
}

export default function BranchModulesPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  // Fetch branches
  const { data: branches = [], isLoading: branchesLoading } = useQuery({
    queryKey: ["branches", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from("branches")
        .select("id, name, code")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch modules with status
  const { data: modules = [], isLoading: modulesLoading, refetch: refetchModules } = useQuery({
    queryKey: ["branch-modules-status", selectedBranchId, profile?.organization_id],
    queryFn: async () => {
      if (!selectedBranchId || !profile?.organization_id) return [];

      // Fetch all available modules
      const { data: availableModules, error: modulesError } = await supabase
        .from("available_modules")
        .select("*")
        .order("sort_order");
      if (modulesError) throw modulesError;

      // Fetch organization modules
      const { data: orgModules, error: orgError } = await supabase
        .from("organization_modules")
        .select("module_code, is_enabled")
        .eq("organization_id", profile.organization_id);
      if (orgError) throw orgError;

      // Fetch branch modules
      const { data: branchModules, error: branchError } = await supabase
        .from("branch_modules")
        .select("module_code, is_enabled")
        .eq("branch_id", selectedBranchId);
      if (branchError) throw branchError;

      const orgModuleMap = new Map(orgModules.map((m) => [m.module_code, m.is_enabled]));
      const branchModuleMap = new Map(branchModules.map((m) => [m.module_code, m.is_enabled]));

      const modulesWithStatus: ModuleWithStatus[] = availableModules.map((mod) => ({
        code: mod.code,
        name: mod.name,
        description: mod.description,
        category: mod.category,
        icon: mod.icon,
        is_core: mod.is_core || false,
        is_hospital_only: mod.is_hospital_only || false,
        org_enabled: orgModuleMap.get(mod.code) ?? true, // Default to enabled if not set
        branch_enabled: branchModuleMap.has(mod.code) 
          ? branchModuleMap.get(mod.code)! 
          : orgModuleMap.get(mod.code) ?? true, // Inherit from org if not overridden
        branch_override: branchModuleMap.has(mod.code),
      }));

      return modulesWithStatus;
    },
    enabled: !!selectedBranchId && !!profile?.organization_id,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ moduleCode, enabled }: { moduleCode: string; enabled: boolean }) => {
      if (!selectedBranchId || !profile?.id) throw new Error("Missing context");

      // Check if branch module record exists
      const { data: existing } = await supabase
        .from("branch_modules")
        .select("id")
        .eq("branch_id", selectedBranchId)
        .eq("module_code", moduleCode)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("branch_modules")
          .update({ is_enabled: enabled })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("branch_modules")
          .insert({
            branch_id: selectedBranchId,
            module_code: moduleCode,
            is_enabled: enabled,
            enabled_by: profile.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      refetchModules();
      toast({
        title: "Module Updated",
        description: "Branch module setting has been saved.",
      });
    },
    onError: (error) => {
      console.error("Error toggling module:", error);
      toast({
        title: "Error",
        description: "Failed to update module setting.",
        variant: "destructive",
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (moduleCode: string) => {
      if (!selectedBranchId) throw new Error("No branch selected");

      const { error } = await supabase
        .from("branch_modules")
        .delete()
        .eq("branch_id", selectedBranchId)
        .eq("module_code", moduleCode);
      if (error) throw error;
    },
    onSuccess: () => {
      refetchModules();
      toast({
        title: "Reset to Default",
        description: "Module will now inherit organization setting.",
      });
    },
  });

  // Group modules by category
  const groupedModules = modules.reduce((acc, mod) => {
    const category = mod.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(mod);
    return acc;
  }, {} as Record<string, ModuleWithStatus[]>);

  const isLoading = branchesLoading || (selectedBranchId && modulesLoading);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Branch Module Control</h1>
          <p className="text-muted-foreground">
            Enable or disable specific modules for each branch
          </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          By default, branches inherit module settings from the organization. You can override settings for specific branches here.
          Modules disabled at the organization level cannot be enabled at the branch level.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="h-5 w-5" />
            Module Configuration
          </CardTitle>
          <CardDescription>
            Select a branch to configure its available modules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Select Branch
            </Label>
            <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
              <SelectTrigger className="w-full md:w-80">
                <SelectValue placeholder="Choose a branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name} ({branch.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBranchId && (
            <>
              {modulesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedModules).map(([category, categoryModules]) => (
                    <div key={category} className="space-y-3">
                      <h3 className="font-semibold text-lg">{category}</h3>
                      <div className="grid gap-3">
                        {categoryModules.map((mod) => (
                          <div
                            key={mod.code}
                            className={`flex items-center justify-between p-4 border rounded-lg ${
                              !mod.org_enabled
                                ? "bg-muted/50 opacity-60"
                                : mod.branch_override
                                ? "border-primary/30 bg-primary/5"
                                : ""
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{mod.name}</span>
                                {mod.is_core && (
                                  <Badge variant="secondary" className="text-xs">
                                    Core
                                  </Badge>
                                )}
                                {mod.branch_override && (
                                  <Badge variant="outline" className="text-xs">
                                    Overridden
                                  </Badge>
                                )}
                                {!mod.org_enabled && (
                                  <Badge variant="destructive" className="text-xs">
                                    Org Disabled
                                  </Badge>
                                )}
                              </div>
                              {mod.description && (
                                <p className="text-sm text-muted-foreground">
                                  {mod.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {mod.branch_override && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => resetMutation.mutate(mod.code)}
                                  disabled={resetMutation.isPending}
                                >
                                  Reset
                                </Button>
                              )}
                              <Switch
                                checked={mod.branch_enabled}
                                onCheckedChange={(checked) =>
                                  toggleMutation.mutate({
                                    moduleCode: mod.code,
                                    enabled: checked,
                                  })
                                }
                                disabled={
                                  !mod.org_enabled ||
                                  mod.is_core ||
                                  toggleMutation.isPending
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

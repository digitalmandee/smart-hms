import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvailableModules } from "@/hooks/useOrganizationModules";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Stethoscope, Pill, FlaskConical, Scan, Building2,
  HeartPulse, Droplet, Scissors, Users, Receipt,
  Package, Calculator, LayoutDashboard, Settings,
  ClipboardList, Ambulance, Baby, Shield, Calendar
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Stethoscope,
  Pill,
  FlaskConical,
  Scan,
  Building2,
  HeartPulse,
  Droplet,
  Scissors,
  Users,
  Receipt,
  Package,
  Calculator,
  LayoutDashboard,
  Settings,
  ClipboardList,
  Ambulance,
  Baby,
  Shield,
  Calendar,
};

export function ModuleCatalogPage() {
  const { data: modules, isLoading: modulesLoading } = useAvailableModules();

  // Get module usage stats across all organizations
  const { data: moduleStats, isLoading: statsLoading } = useQuery({
    queryKey: ['module-catalog-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_modules')
        .select('module_code, is_enabled')
        .eq('is_enabled', true);

      if (error) throw error;

      // Count enabled organizations per module
      const counts: Record<string, number> = {};
      data?.forEach(item => {
        counts[item.module_code] = (counts[item.module_code] || 0) + 1;
      });
      return counts;
    },
  });

  // Get total organizations count
  const { data: totalOrgs } = useQuery({
    queryKey: ['total-organizations-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const isLoading = modulesLoading || statsLoading;

  // Group modules by category
  const groupedModules = modules?.reduce((acc, module) => {
    const category = module.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(module);
    return acc;
  }, {} as Record<string, typeof modules>);

  return (
    <div>
      <PageHeader
        title="Module Catalog"
        description="Overview of all available modules and their adoption across organizations"
        breadcrumbs={[
          { label: "Super Admin", href: "/super-admin/dashboard" },
          { label: "Module Catalog" },
        ]}
      />

      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modules?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Core Modules</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {modules?.filter(m => m.is_core).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrgs || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Module Categories */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-24 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          Object.entries(groupedModules || {}).map(([category, categoryModules]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
                <CardDescription>
                  {categoryModules?.length} module{categoryModules?.length !== 1 ? 's' : ''} in this category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {categoryModules?.map((module) => {
                    const IconComponent = iconMap[module.icon || ''] || Package;
                    const enabledCount = moduleStats?.[module.code] || 0;
                    const adoptionRate = totalOrgs ? Math.round((enabledCount / totalOrgs) * 100) : 0;

                    return (
                      <Card key={module.id} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-medium text-sm">{module.name}</h4>
                                {module.is_core && (
                                  <Badge variant="default" className="text-xs">Core</Badge>
                                )}
                                {module.is_hospital_only && (
                                  <Badge variant="secondary" className="text-xs">Hospital Only</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {module.description || 'No description'}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${adoptionRate}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {enabledCount}/{totalOrgs} orgs
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

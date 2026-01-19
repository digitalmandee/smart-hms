import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizationModulesWithStatus, useToggleOrganizationModule } from "@/hooks/useOrganizationModules";
import {
  Stethoscope,
  BedDouble,
  FlaskConical,
  Pill,
  Receipt,
  Users,
  Calendar,
  HeartPulse,
  Syringe,
  Droplets,
  Baby,
  Scissors,
  Ambulance,
  ClipboardList,
  Package,
  Wallet,
  Building2,
  UserCog,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Stethoscope,
  BedDouble,
  FlaskConical,
  Pill,
  Receipt,
  Users,
  Calendar,
  HeartPulse,
  Syringe,
  Droplets,
  Baby,
  Scissors,
  Ambulance,
  ClipboardList,
  Package,
  Wallet,
  Building2,
  UserCog,
};

export default function OrgModulesPage() {
  const { profile } = useAuth();
  const organizationId = profile?.organization_id;
  
  const { data: modules, isLoading } = useOrganizationModulesWithStatus(organizationId || "");
  const toggleModule = useToggleOrganizationModule();

  const handleToggle = (moduleCode: string, currentEnabled: boolean) => {
    if (!organizationId) return;
    toggleModule.mutate({
      organizationId,
      moduleCode,
      isEnabled: !currentEnabled,
    });
  };

  // Group modules by category
  const groupedModules = modules?.reduce((acc, module) => {
    const category = module.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(module);
    return acc;
  }, {} as Record<string, typeof modules>);

  if (!organizationId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No organization found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modules"
        description="Enable or disable modules for your organization"
        breadcrumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "Modules" },
        ]}
      />

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-16 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(groupedModules || {}).map(([category, categoryModules]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
                <CardDescription>
                  {categoryModules?.filter((m) => m.is_enabled).length} of{" "}
                  {categoryModules?.length} modules enabled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryModules?.map((module) => {
                  const IconComponent = iconMap[module.icon || ""] || Building2;
                  return (
                    <div
                      key={module.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{module.name}</p>
                            {module.is_core && (
                              <Badge variant="secondary" className="text-xs">
                                Core
                              </Badge>
                            )}
                            {module.is_hospital_only && (
                              <Badge variant="outline" className="text-xs">
                                Hospital Only
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {module.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={module.is_enabled}
                        onCheckedChange={() => handleToggle(module.code, module.is_enabled)}
                        disabled={module.is_core || toggleModule.isPending}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

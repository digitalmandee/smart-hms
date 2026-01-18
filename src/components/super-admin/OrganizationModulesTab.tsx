import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizationModulesWithStatus, useToggleOrganizationModule } from "@/hooks/useOrganizationModules";
import { 
  Users, Calendar, Stethoscope, Bed, Pill, ShoppingCart, 
  FlaskConical, Scan, CreditCard, Calculator, Siren, 
  Scissors, Droplet, BarChart, Settings, LucideIcon
} from "lucide-react";

interface OrganizationModulesTabProps {
  organizationId: string;
  facilityType?: string;
}

const iconMap: Record<string, LucideIcon> = {
  Users,
  Calendar,
  Stethoscope,
  Bed,
  Pill,
  ShoppingCart,
  FlaskConical,
  Scan,
  CreditCard,
  Calculator,
  Siren,
  Scissors,
  Droplet,
  BarChart,
  Settings,
};

const categoryLabels: Record<string, string> = {
  core: "Core Modules",
  clinical: "Clinical Modules",
  ancillary: "Ancillary Services",
  finance: "Finance & Billing",
  admin: "Administration",
};

export function OrganizationModulesTab({ organizationId, facilityType }: OrganizationModulesTabProps) {
  const { data: modules, isLoading } = useOrganizationModulesWithStatus(organizationId);
  const toggleModule = useToggleOrganizationModule();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enabled Modules</CardTitle>
          <CardDescription>Toggle which modules are available for this organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Group modules by category
  const groupedModules = (modules || []).reduce((acc, module) => {
    const category = module.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(module);
    return acc;
  }, {} as Record<string, typeof modules>);

  const handleToggle = (moduleCode: string, isEnabled: boolean) => {
    toggleModule.mutate({
      organizationId,
      moduleCode,
      isEnabled,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enabled Modules</CardTitle>
        <CardDescription>
          Toggle which modules are available for this organization. 
          {facilityType === "clinic" && (
            <span className="text-warning"> Hospital-only modules are recommended to be disabled for clinics.</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(categoryLabels).map(([category, label]) => {
          const categoryModules = groupedModules[category];
          if (!categoryModules || categoryModules.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {label}
              </h4>
              <div className="grid gap-3">
                {categoryModules.map((module) => {
                  const Icon = iconMap[module.icon || "Settings"] || Settings;
                  const isHospitalOnly = module.is_hospital_only;
                  const isCore = module.is_core;

                  return (
                    <div
                      key={module.code}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={module.code} className="font-medium cursor-pointer">
                              {module.name}
                            </Label>
                            {isCore && (
                              <Badge variant="secondary" className="text-xs">Core</Badge>
                            )}
                            {isHospitalOnly && (
                              <Badge variant="outline" className="text-xs border-warning text-warning">
                                Hospital Only
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{module.description}</p>
                        </div>
                      </div>
                      <Switch
                        id={module.code}
                        checked={module.is_enabled}
                        onCheckedChange={(checked) => handleToggle(module.code, checked)}
                        disabled={toggleModule.isPending || isCore}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

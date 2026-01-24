import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ROLE_CATEGORIES, type AppRole } from "@/constants/roles";
import { generateRandomPassword } from "@/hooks/useStaffManagement";
import { KeyRound, RefreshCw, ChevronDown, Mail, Lock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginAccountSectionProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  email: string;
  onEmailChange: (email: string) => void;
  password: string;
  onPasswordChange: (password: string) => void;
  selectedRoles: AppRole[];
  onRolesChange: (roles: AppRole[]) => void;
  disabled?: boolean;
}

export function LoginAccountSection({
  enabled,
  onEnabledChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  selectedRoles,
  onRolesChange,
  disabled = false,
}: LoginAccountSectionProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleGeneratePassword = () => {
    onPasswordChange(generateRandomPassword());
  };

  const handleRoleToggle = (role: AppRole, checked: boolean) => {
    if (checked) {
      onRolesChange([...selectedRoles, role]);
    } else {
      onRolesChange(selectedRoles.filter((r) => r !== role));
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">System Login Account</CardTitle>
              <CardDescription className="text-xs">
                Enable to create login credentials for this employee
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            disabled={disabled}
          />
        </div>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-6 pt-0">
          {/* Credentials Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Email Address *
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="employee@hospital.com"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                Password *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  disabled={disabled}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleGeneratePassword}
                  disabled={disabled}
                  title="Generate password"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? "Hide" : "Show"} password
                </button>
              )}
            </div>
          </div>

          {/* Roles Section */}
          <div className="space-y-3">
            <Label className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Assign Roles
            </Label>
            {selectedRoles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pb-2">
                {selectedRoles.map((role) => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            )}
            <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-md p-3">
              {Object.entries(ROLE_CATEGORIES).map(([key, category]) => (
                <Collapsible key={key} defaultOpen={key === "clinical" || key === "nursing"}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5 px-2 rounded hover:bg-muted text-sm font-medium">
                    {category.label}
                    <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-1 pt-1">
                    {category.roles.map((role) => (
                      <div key={role.value} className="flex items-start gap-2 py-1">
                        <Checkbox
                          id={`role-${role.value}`}
                          checked={selectedRoles.includes(role.value)}
                          onCheckedChange={(checked) =>
                            handleRoleToggle(role.value, checked === true)
                          }
                          disabled={disabled}
                        />
                        <div className="grid gap-0.5 leading-none">
                          <Label
                            htmlFor={`role-${role.value}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {role.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

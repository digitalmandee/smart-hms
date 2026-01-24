import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ROLE_CATEGORIES, type AppRole } from "@/constants/roles";
import { generateRandomPassword, useCreateStaffUser } from "@/hooks/useStaffManagement";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, RefreshCw, ChevronDown, Mail, Lock, Shield, KeyRound } from "lucide-react";

interface CreateLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: {
    id: string;
    first_name: string;
    last_name?: string | null;
    personal_email?: string | null;
    personal_phone?: string | null;
    gender?: string | null;
    date_of_birth?: string | null;
    branch_id?: string | null;
    department_id?: string | null;
    designation_id?: string | null;
    category_id?: string | null;
    join_date: string;
    shift_id?: string | null;
  };
  onSuccess?: () => void;
}

export function CreateLoginDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: CreateLoginDialogProps) {
  const { profile } = useAuth();
  const createStaffUser = useCreateStaffUser();
  
  const [email, setEmail] = useState(employee.personal_email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);

  const handleGeneratePassword = () => {
    setPassword(generateRandomPassword());
  };

  const handleRoleToggle = (role: AppRole, checked: boolean) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, role]);
    } else {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.organization_id) return;
    if (!email || !password) return;

    try {
      await createStaffUser.mutateAsync({
        email,
        password,
        first_name: employee.first_name,
        last_name: employee.last_name || undefined,
        phone: employee.personal_phone || undefined,
        gender: employee.gender || undefined,
        date_of_birth: employee.date_of_birth || undefined,
        organization_id: profile.organization_id,
        branch_id: employee.branch_id || undefined,
        department_id: employee.department_id || undefined,
        designation_id: employee.designation_id || undefined,
        category_id: employee.category_id || undefined,
        roles: selectedRoles.length > 0 ? selectedRoles : undefined,
        join_date: employee.join_date || undefined,
        shift_id: employee.shift_id || undefined,
      });
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Create Login Account</DialogTitle>
              <DialogDescription>
                Create system access for {employee.first_name} {employee.last_name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Credentials */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dialog-email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Email Address *
              </Label>
              <Input
                id="dialog-email"
                type="email"
                placeholder="employee@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-password" className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                Password *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="dialog-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleGeneratePassword}
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

          {/* Roles */}
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
            <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-3">
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
                          id={`dialog-role-${role.value}`}
                          checked={selectedRoles.includes(role.value)}
                          onCheckedChange={(checked) =>
                            handleRoleToggle(role.value, checked === true)
                          }
                        />
                        <div className="grid gap-0.5 leading-none">
                          <Label
                            htmlFor={`dialog-role-${role.value}`}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createStaffUser.isPending || !email || !password}>
              {createStaffUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Login
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

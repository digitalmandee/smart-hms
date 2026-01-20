import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Shield, Save, Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ALL_ROLES = [
  { value: "branch_admin", label: "Branch Admin", description: "Full branch management access" },
  { value: "doctor", label: "Doctor", description: "OPD consultations and patient care" },
  { value: "nurse", label: "Nurse", description: "OPD nursing and triage" },
  { value: "ipd_nurse", label: "IPD Nurse", description: "Inpatient nursing care" },
  { value: "receptionist", label: "Receptionist", description: "Front desk and appointments" },
  { value: "pharmacist", label: "Pharmacist", description: "Pharmacy and dispensing" },
  { value: "lab_technician", label: "Lab Technician", description: "Laboratory services" },
  { value: "radiologist", label: "Radiologist", description: "Radiology reporting" },
  { value: "radiology_technician", label: "Radiology Technician", description: "Imaging and scans" },
  { value: "blood_bank_technician", label: "Blood Bank Technician", description: "Blood bank operations" },
  { value: "ot_technician", label: "OT Technician", description: "Operation theatre support" },
  { value: "hr_manager", label: "HR Manager", description: "Full HR management" },
  { value: "hr_officer", label: "HR Officer", description: "Basic HR operations" },
  { value: "accountant", label: "Accountant", description: "Accounting and finance" },
  { value: "store_manager", label: "Store Manager", description: "Inventory management" },
];

export default function BranchRolesPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [restrictedRoles, setRestrictedRoles] = useState<string[]>([]);

  const { data: branches = [], isLoading: branchesLoading } = useQuery({
    queryKey: ["branches", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase.from("branches").select("id, name, code").eq("organization_id", profile.organization_id).eq("is_active", true).order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const { isLoading: restrictionsLoading } = useQuery({
    queryKey: ["branch-role-restrictions", selectedBranchId],
    queryFn: async () => {
      if (!selectedBranchId) return [];
      const { data, error } = await supabase.from("branch_role_restrictions").select("role").eq("branch_id", selectedBranchId);
      if (error) throw error;
      setRestrictedRoles(data.map((r) => r.role));
      return data;
    },
    enabled: !!selectedBranchId,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBranchId) throw new Error("No branch selected");
      await supabase.from("branch_role_restrictions").delete().eq("branch_id", selectedBranchId);
      if (restrictedRoles.length > 0) {
        const { error } = await supabase.from("branch_role_restrictions").insert(restrictedRoles.map((role) => ({ branch_id: selectedBranchId, role })));
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branch-role-restrictions"] });
      toast({ title: "Roles Updated", description: "Branch role restrictions saved." });
    },
    onError: () => toast({ title: "Error", description: "Failed to save.", variant: "destructive" }),
  });

  const toggleRole = (role: string) => setRestrictedRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold">Branch Role Restrictions</h1>
          <p className="text-muted-foreground">Control which roles can operate in each branch</p>
        </div>
      </div>

      <Alert><Info className="h-4 w-4" /><AlertDescription>Check the roles you want to <strong>restrict</strong> for a specific branch.</AlertDescription></Alert>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Role Restrictions</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Select Branch</Label>
            <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
              <SelectTrigger className="w-full md:w-80"><SelectValue placeholder="Choose a branch" /></SelectTrigger>
              <SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name} ({b.code})</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {selectedBranchId && (
            <>
              {restrictionsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ALL_ROLES.map((role) => (
                    <div key={role.value} className={`flex items-start space-x-3 p-3 border rounded-lg ${restrictedRoles.includes(role.value) ? "bg-destructive/10 border-destructive/30" : ""}`}>
                      <Checkbox id={role.value} checked={restrictedRoles.includes(role.value)} onCheckedChange={() => toggleRole(role.value)} />
                      <div><Label htmlFor={role.value} className="cursor-pointer font-medium">{role.label}</Label><p className="text-xs text-muted-foreground">{role.description}</p></div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end pt-4">
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Restrictions
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

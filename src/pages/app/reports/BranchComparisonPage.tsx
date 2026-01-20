import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Building2, Users, CalendarCheck } from "lucide-react";

export default function BranchComparisonPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const { data: branchStats, isLoading } = useQuery({
    queryKey: ["branch-comparison", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data: branches } = await supabase
        .from("branches")
        .select("id, name, code")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("name");

      if (!branches) return [];

      const today = new Date().toISOString().split("T")[0];
      const stats = await Promise.all(
        branches.map(async (branch) => {
          const [patientsRes, appointmentsRes, staffRes] = await Promise.all([
            supabase.from("patients").select("*", { count: "exact", head: true }).eq("branch_id", branch.id),
            supabase.from("appointments").select("*", { count: "exact", head: true }).eq("branch_id", branch.id).eq("appointment_date", today),
            supabase.from("profiles").select("*", { count: "exact", head: true }).eq("branch_id", branch.id),
          ]);
          return {
            ...branch,
            patients: patientsRes.count || 0,
            appointmentsToday: appointmentsRes.count || 0,
            staff: staffRes.count || 0,
          };
        })
      );
      return stats;
    },
    enabled: !!profile?.organization_id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold">Branch Comparison</h1>
          <p className="text-muted-foreground">Compare metrics across all branches</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Branch Statistics</CardTitle>
          <CardDescription>Side-by-side comparison of key metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : branchStats && branchStats.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right"><Users className="h-4 w-4 inline mr-1" />Patients</TableHead>
                  <TableHead className="text-right"><CalendarCheck className="h-4 w-4 inline mr-1" />Today's Appts</TableHead>
                  <TableHead className="text-right">Staff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchStats.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name} <span className="text-muted-foreground">({branch.code})</span></TableCell>
                    <TableCell className="text-right">{branch.patients.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{branch.appointmentsToday}</TableCell>
                    <TableCell className="text-right">{branch.staff}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No branches found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, BookOpen, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function MyTrainingPage() {
  const { user, profile } = useAuth();

  const { data: employee } = useQuery({
    queryKey: ['my-employee-record', user?.id],
    queryFn: async () => {
      if (!user?.id || !profile?.organization_id) return null;
      const { data } = await supabase
        .from('employees')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id && !!profile?.organization_id,
  });

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['my-training-enrollments', employee?.id],
    queryFn: async () => {
      if (!employee?.id) return [];
      const { data, error } = await (supabase as any)
        .from('training_enrollments')
        .select(`*, program:program_id(id, title, description, start_date, end_date, status)`)
        .eq('employee_id', employee.id)
        .order('enrolled_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!employee?.id,
  });

  const statusColors: Record<string, string> = {
    enrolled: "bg-blue-100 text-blue-800",
    in_progress: "bg-amber-100 text-amber-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const stats = {
    total: enrollments?.length || 0,
    completed: enrollments?.filter((e: any) => e.status === "completed").length || 0,
    inProgress: enrollments?.filter((e: any) => e.status === "in_progress" || e.status === "enrolled").length || 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Training" description="View your enrolled training programs and certifications" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Enrollments", value: stats.total, icon: BookOpen, color: "text-primary" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-green-600" },
          { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-amber-600" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div>
                <s.icon className={`h-8 w-8 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Training Enrollments</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !enrollments?.length ? (
            <p className="text-center py-8 text-muted-foreground">No training enrollments found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        {e.program?.title || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{e.program?.description || "—"}</TableCell>
                    <TableCell>{e.program?.start_date ? format(new Date(e.program.start_date), "dd MMM yyyy") : "—"}</TableCell>
                    <TableCell>{e.program?.end_date ? format(new Date(e.program.end_date), "dd MMM yyyy") : "—"}</TableCell>
                    <TableCell><Badge className={statusColors[e.status] || "bg-gray-100 text-gray-800"}>{e.status?.replace("_", " ") || "—"}</Badge></TableCell>
                    <TableCell>{e.score != null ? `${e.score}%` : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

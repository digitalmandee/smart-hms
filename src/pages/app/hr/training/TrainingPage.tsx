import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTrainingPrograms, useCreateTrainingProgram, useTrainingEnrollments, useEnrollEmployee, useUpdateEnrollmentStatus, TRAINING_CATEGORIES } from "@/hooks/useTraining";
import { useEmployees } from "@/hooks/useHR";
import { useTranslation } from "@/lib/i18n";
import { GraduationCap, Plus, UserPlus, Loader2, BookOpen, CheckCircle, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function TrainingPage() {
  const { t } = useTranslation();
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [programForm, setProgramForm] = useState({ name: "", description: "", category: "general", is_mandatory: false, duration_hours: 0, instructor: "" });
  const [enrollForm, setEnrollForm] = useState({ program_id: "", employee_id: "" });

  const { data: programs, isLoading: loadingPrograms } = useTrainingPrograms();
  const { data: enrollments, isLoading: loadingEnrollments } = useTrainingEnrollments();
  const { data: employees } = useEmployees();
  const createProgram = useCreateTrainingProgram();
  const enrollEmployee = useEnrollEmployee();
  const updateStatus = useUpdateEnrollmentStatus();

  const handleCreateProgram = async () => {
    await createProgram.mutateAsync({ ...programForm, duration_hours: programForm.duration_hours || undefined });
    setIsProgramDialogOpen(false);
    setProgramForm({ name: "", description: "", category: "general", is_mandatory: false, duration_hours: 0, instructor: "" });
  };

  const handleEnroll = async () => {
    await enrollEmployee.mutateAsync(enrollForm);
    setIsEnrollDialogOpen(false);
    setEnrollForm({ program_id: "", employee_id: "" });
  };

  if (loadingPrograms || loadingEnrollments) {
    return <div className="space-y-6"><PageHeader title="Training & Development" description="Manage training programs and enrollments" /><Skeleton className="h-64" /></div>;
  }

  const totalPrograms = (programs || []).length;
  const mandatory = (programs || []).filter((p: any) => p.is_mandatory).length;
  const enrolled = (enrollments || []).length;
  const completed = (enrollments || []).filter((e: any) => e.status === "completed").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Training & Development" subtitle="Manage training programs and employee enrollments">
        <div className="flex gap-2">
          <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
            <DialogTrigger asChild><Button variant="outline"><Plus className="h-4 w-4 mr-2" />New Program</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Training Program</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Program Name</Label><Input value={programForm.name} onChange={e => setProgramForm({ ...programForm, name: e.target.value })} /></div>
                <div><Label>Category</Label>
                  <Select value={programForm.category} onValueChange={v => setProgramForm({ ...programForm, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TRAINING_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Description</Label><Textarea rows={3} value={programForm.description} onChange={e => setProgramForm({ ...programForm, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Duration (hours)</Label><Input type="number" value={programForm.duration_hours} onChange={e => setProgramForm({ ...programForm, duration_hours: Number(e.target.value) })} /></div>
                  <div><Label>Instructor</Label><Input value={programForm.instructor} onChange={e => setProgramForm({ ...programForm, instructor: e.target.value })} /></div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={programForm.is_mandatory} onCheckedChange={v => setProgramForm({ ...programForm, is_mandatory: v })} />
                  <Label>Mandatory Training</Label>
                </div>
                <Button className="w-full" onClick={handleCreateProgram} disabled={createProgram.isPending || !programForm.name}>
                  {createProgram.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Create Program
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
            <DialogTrigger asChild><Button><UserPlus className="h-4 w-4 mr-2" />Enroll Employee</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Enroll Employee</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Program</Label>
                  <Select value={enrollForm.program_id} onValueChange={v => setEnrollForm({ ...enrollForm, program_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                    <SelectContent>{(programs || []).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Employee</Label>
                  <Select value={enrollForm.employee_id} onValueChange={v => setEnrollForm({ ...enrollForm, employee_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>{(employees || []).map(e => <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleEnroll} disabled={enrollEmployee.isPending || !enrollForm.program_id || !enrollForm.employee_id}>
                  {enrollEmployee.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Enroll
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{totalPrograms}</div><p className="text-sm text-muted-foreground">Programs</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-amber-600">{mandatory}</div><p className="text-sm text-muted-foreground">Mandatory</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-blue-600">{enrolled}</div><p className="text-sm text-muted-foreground">Enrollments</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-600">{completed}</div><p className="text-sm text-muted-foreground">Completed</p></CardContent></Card>
      </div>

      <Tabs defaultValue="programs">
        <TabsList><TabsTrigger value="programs">Programs</TabsTrigger><TabsTrigger value="enrollments">Enrollments</TabsTrigger></TabsList>

        <TabsContent value="programs" className="space-y-4">
          {(programs || []).length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No training programs yet</p></CardContent></Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(programs || []).map((prog: any) => (
                <Card key={prog.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{prog.name}</CardTitle>
                      {prog.is_mandatory && <Badge variant="destructive">Mandatory</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <Badge variant="outline">{TRAINING_CATEGORIES.find(c => c.value === prog.category)?.label || prog.category}</Badge>
                      {prog.description && <p className="text-muted-foreground line-clamp-2">{prog.description}</p>}
                      <div className="flex gap-4 text-muted-foreground">
                        {prog.duration_hours && <span><Clock className="h-3 w-3 inline mr-1" />{prog.duration_hours}h</span>}
                        {prog.instructor && <span>👨‍🏫 {prog.instructor}</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="enrollments">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(enrollments || []).length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No enrollments yet</TableCell></TableRow>
                  ) : (
                    (enrollments || []).map((enr: any) => (
                      <TableRow key={enr.id}>
                        <TableCell>{enr.employee?.first_name} {enr.employee?.last_name}</TableCell>
                        <TableCell>{enr.program?.name}</TableCell>
                        <TableCell>{format(parseISO(enr.enrolled_at), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Badge variant={enr.status === "completed" ? "default" : enr.status === "in_progress" ? "secondary" : "outline"}>
                            {enr.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {enr.status !== "completed" && (
                            <Button size="sm" variant="ghost" onClick={() => updateStatus.mutate({ id: enr.id, status: "completed" })}>
                              <CheckCircle className="h-4 w-4 mr-1" />Complete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { usePromotions, useCreatePromotion } from "@/hooks/usePromotions";
import { useEmployees } from "@/hooks/useHR";
import { useDesignations } from "@/hooks/useHR";
import { Plus, TrendingUp, Award, Calendar, Users } from "lucide-react";
import { format } from "date-fns";

export default function PromotionsPage() {
  const [showDialog, setShowDialog] = useState(false);
  const { data: promotions, isLoading } = usePromotions();
  const { data: employees } = useEmployees();
  const { data: designations } = useDesignations();
  const createPromotion = useCreatePromotion();

  const [form, setForm] = useState({
    employee_id: "", old_designation_id: "", new_designation_id: "",
    old_salary: "", new_salary: "",
    effective_date: new Date().toISOString().split("T")[0], reason: "",
  });

  const handleEmployeeChange = (empId: string) => {
    const emp = employees?.find((e: any) => e.id === empId);
    setForm(f => ({ ...f, employee_id: empId, old_designation_id: emp?.designation_id || "" }));
  };

  const handleSubmit = () => {
    if (!form.employee_id || !form.new_designation_id || !form.effective_date) return;
    createPromotion.mutate({
      employee_id: form.employee_id,
      old_designation_id: form.old_designation_id || undefined,
      new_designation_id: form.new_designation_id,
      old_salary: form.old_salary ? parseFloat(form.old_salary) : undefined,
      new_salary: form.new_salary ? parseFloat(form.new_salary) : undefined,
      effective_date: form.effective_date,
      reason: form.reason || undefined,
    }, {
      onSuccess: () => {
        setShowDialog(false);
        setForm({ employee_id: "", old_designation_id: "", new_designation_id: "", old_salary: "", new_salary: "", effective_date: new Date().toISOString().split("T")[0], reason: "" });
      },
    });
  };

  const getDesignationName = (id: string) => designations?.find((d: any) => d.id === id)?.name || "—";

  const stats = {
    total: promotions?.length || 0,
    thisYear: promotions?.filter((p: any) => new Date(p.effective_date).getFullYear() === new Date().getFullYear()).length || 0,
    withSalaryIncrease: promotions?.filter((p: any) => p.new_salary && p.old_salary && p.new_salary > p.old_salary).length || 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Promotion Management" description="Track employee promotions and designation changes">
        <Button onClick={() => setShowDialog(true)}><Plus className="h-4 w-4 mr-2" />Record Promotion</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Promotions", value: stats.total, icon: Award, color: "text-primary" },
          { label: "This Year", value: stats.thisYear, icon: Calendar, color: "text-green-600" },
          { label: "With Salary Increase", value: stats.withSalaryIncrease, icon: TrendingUp, color: "text-blue-600" },
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
        <CardHeader><CardTitle>Promotion History</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !promotions?.length ? (
            <div className="text-center py-8 text-muted-foreground">No promotion records found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Previous Designation</TableHead>
                  <TableHead>New Designation</TableHead>
                  <TableHead>Salary Change</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.employee?.first_name} {p.employee?.last_name}
                      <div className="text-xs text-muted-foreground">{p.employee?.employee_number}</div>
                    </TableCell>
                    <TableCell>{p.old_designation?.title || "—"}</TableCell>
                    <TableCell><Badge variant="default">{p.new_designation?.title || "—"}</Badge></TableCell>
                    <TableCell>
                      {p.old_salary && p.new_salary ? (
                        <span className={p.new_salary > p.old_salary ? "text-green-600" : ""}>
                          {p.old_salary.toLocaleString()} → {p.new_salary.toLocaleString()}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{format(new Date(p.effective_date), "dd MMM yyyy")}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{p.reason || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Record Promotion</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employee *</Label>
              <Select value={form.employee_id} onValueChange={handleEmployeeChange}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees?.map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_number})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Previous Designation</Label>
                <Select value={form.old_designation_id} onValueChange={v => setForm(f => ({ ...f, old_designation_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Previous" /></SelectTrigger>
                  <SelectContent>
                    {designations?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>New Designation *</Label>
                <Select value={form.new_designation_id} onValueChange={v => setForm(f => ({ ...f, new_designation_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="New" /></SelectTrigger>
                  <SelectContent>
                    {designations?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Previous Salary</Label><Input type="number" value={form.old_salary} onChange={e => setForm(f => ({ ...f, old_salary: e.target.value }))} /></div>
              <div><Label>New Salary</Label><Input type="number" value={form.new_salary} onChange={e => setForm(f => ({ ...f, new_salary: e.target.value }))} /></div>
            </div>
            <div><Label>Effective Date *</Label><Input type="date" value={form.effective_date} onChange={e => setForm(f => ({ ...f, effective_date: e.target.value }))} /></div>
            <div><Label>Reason</Label><Textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Reason for promotion" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createPromotion.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
import { useGrievances, useCreateGrievance, useUpdateGrievance, GRIEVANCE_CATEGORIES, GRIEVANCE_STATUSES } from "@/hooks/useGrievances";
import { useEmployees } from "@/hooks/useHR";
import { Plus, MessageSquareWarning, Clock, CheckCircle, Search, Eye, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function GrievancesPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: grievances, isLoading } = useGrievances(statusFilter !== "all" ? statusFilter : undefined);
  const { data: employees } = useEmployees();
  const createGrievance = useCreateGrievance();
  const updateGrievance = useUpdateGrievance();

  const [form, setForm] = useState({
    employee_id: "", category: "", subject: "", description: "",
    filed_date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = () => {
    if (!form.employee_id || !form.category || !form.subject) return;
    createGrievance.mutate(form, {
      onSuccess: () => {
        setShowAddDialog(false);
        setForm({ employee_id: "", category: "", subject: "", description: "", filed_date: new Date().toISOString().split("T")[0] });
      },
    });
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    const updates: any = { id, status: newStatus };
    if (newStatus === "resolved" || newStatus === "closed") updates.resolved_date = new Date().toISOString().split("T")[0];
    updateGrievance.mutate(updates);
  };

  const getStatusColor = (status: string) => GRIEVANCE_STATUSES.find(s => s.value === status)?.color || "bg-gray-100 text-gray-800";
  const getCategoryLabel = (cat: string) => GRIEVANCE_CATEGORIES.find(c => c.value === cat)?.label || cat;

  const stats = {
    total: grievances?.length || 0,
    open: grievances?.filter((g: any) => !["resolved", "closed"].includes(g.status)).length || 0,
    resolved: grievances?.filter((g: any) => g.status === "resolved").length || 0,
    investigation: grievances?.filter((g: any) => g.status === "investigation").length || 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Grievance Management" subtitle="Track and resolve employee grievances — CBAHI/JCI compliant">
        <Button onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4 mr-2" />File Grievance</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Grievances", value: stats.total, icon: MessageSquareWarning, color: "text-primary" },
          { label: "Open", value: stats.open, icon: Clock, color: "text-amber-600" },
          { label: "Under Investigation", value: stats.investigation, icon: AlertTriangle, color: "text-orange-600" },
          { label: "Resolved", value: stats.resolved, icon: CheckCircle, color: "text-green-600" },
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Grievance Records</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {GRIEVANCE_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !grievances?.length ? (
            <div className="text-center py-8 text-muted-foreground">No grievance records found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grievance #</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Filed Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grievances.map((g: any) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-mono text-xs">{g.grievance_number}</TableCell>
                    <TableCell className="font-medium">
                      {g.employee?.first_name} {g.employee?.last_name}
                      <div className="text-xs text-muted-foreground">{g.employee?.employee_number}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{getCategoryLabel(g.category)}</Badge></TableCell>
                    <TableCell className="max-w-[200px] truncate">{g.subject}</TableCell>
                    <TableCell>{format(new Date(g.filed_date), "dd MMM yyyy")}</TableCell>
                    <TableCell><Badge className={getStatusColor(g.status)}>{g.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setShowDetailDialog(g)}><Eye className="h-3 w-3" /></Button>
                        {g.status === "filed" && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(g.id, "under_review")}>Review</Button>
                        )}
                        {g.status === "under_review" && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(g.id, "investigation")}>Investigate</Button>
                        )}
                        {g.status === "investigation" && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(g.id, "resolved")}>Resolve</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>File Grievance</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employee *</Label>
              <Select value={form.employee_id} onValueChange={v => setForm(f => ({ ...f, employee_id: v }))}>
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
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {GRIEVANCE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Filed Date</Label><Input type="date" value={form.filed_date} onChange={e => setForm(f => ({ ...f, filed_date: e.target.value }))} /></div>
            </div>
            <div><Label>Subject *</Label><Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief subject" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed description" rows={4} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createGrievance.isPending}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!showDetailDialog} onOpenChange={() => setShowDetailDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Grievance Details</DialogTitle></DialogHeader>
          {showDetailDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Grievance #</Label><p className="font-mono">{showDetailDialog.grievance_number}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><Badge className={getStatusColor(showDetailDialog.status)}>{showDetailDialog.status.replace("_", " ")}</Badge></div>
                <div><Label className="text-muted-foreground">Employee</Label><p>{showDetailDialog.employee?.first_name} {showDetailDialog.employee?.last_name}</p></div>
                <div><Label className="text-muted-foreground">Category</Label><p>{getCategoryLabel(showDetailDialog.category)}</p></div>
                <div><Label className="text-muted-foreground">Filed Date</Label><p>{format(new Date(showDetailDialog.filed_date), "dd MMM yyyy")}</p></div>
                {showDetailDialog.resolved_date && <div><Label className="text-muted-foreground">Resolved Date</Label><p>{format(new Date(showDetailDialog.resolved_date), "dd MMM yyyy")}</p></div>}
              </div>
              <div><Label className="text-muted-foreground">Subject</Label><p>{showDetailDialog.subject}</p></div>
              {showDetailDialog.description && <div><Label className="text-muted-foreground">Description</Label><p className="text-sm">{showDetailDialog.description}</p></div>}
              {showDetailDialog.resolution_notes && <div><Label className="text-muted-foreground">Resolution Notes</Label><p className="text-sm">{showDetailDialog.resolution_notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

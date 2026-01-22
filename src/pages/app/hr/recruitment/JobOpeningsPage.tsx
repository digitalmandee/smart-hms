import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Briefcase, Users, Clock, CheckCircle, Loader2, Eye, Pencil, MapPin } from "lucide-react";
import { useJobOpenings, useCreateJobOpening, useUpdateJobOpening } from "@/hooks/useRecruitment";
import { useDepartments, useDesignations } from "@/hooks/useOrganizationSetup";
import { format } from "date-fns";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "open", label: "Open" },
  { value: "on_hold", label: "On Hold" },
  { value: "closed", label: "Closed" },
  { value: "filled", label: "Filled" },
];

const EMPLOYMENT_TYPES = [
  { value: "permanent", label: "Permanent" },
  { value: "contract", label: "Contract" },
  { value: "visiting", label: "Visiting" },
  { value: "intern", label: "Intern" },
];

export default function JobOpeningsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    department_id: "",
    designation_id: "",
    employment_type: "permanent",
    positions_available: 1,
    experience_required: "",
    salary_range_min: 0,
    salary_range_max: 0,
    job_description: "",
    requirements: "",
    benefits: "",
    location: "",
    closes_at: "",
    status: "draft" as const,
  });

  const { data: jobs, isLoading } = useJobOpenings(statusFilter || undefined);
  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();
  const createJob = useCreateJobOpening();
  const updateJob = useUpdateJobOpening();

  const openJobs = jobs?.filter((j) => j.status === "open") || [];
  const filledJobs = jobs?.filter((j) => j.status === "filled") || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await updateJob.mutateAsync({ id: editingJob.id, ...formData });
      } else {
        await createJob.mutateAsync(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by hook
    }
  };

  const resetForm = () => {
    setEditingJob(null);
    setFormData({
      title: "",
      department_id: "",
      designation_id: "",
      employment_type: "permanent",
      positions_available: 1,
      experience_required: "",
      salary_range_min: 0,
      salary_range_max: 0,
      job_description: "",
      requirements: "",
      benefits: "",
      location: "",
      closes_at: "",
      status: "draft",
    });
  };

  const openEditDialog = (job: any) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      department_id: job.department_id || "",
      designation_id: job.designation_id || "",
      employment_type: job.employment_type || "permanent",
      positions_available: job.positions_available || 1,
      experience_required: job.experience_required || "",
      salary_range_min: job.salary_range_min || 0,
      salary_range_max: job.salary_range_max || 0,
      job_description: job.job_description || "",
      requirements: job.requirements || "",
      benefits: job.benefits || "",
      location: job.location || "",
      closes_at: job.closes_at || "",
      status: job.status,
    });
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      open: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      on_hold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      closed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      filled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };
    return <Badge className={colors[status] || ""}>{status.replace("_", " ")}</Badge>;
  };

  const getDepartmentName = (id: string) => departments?.find((d) => d.id === id)?.name || "";
  const getDesignationName = (id: string) => designations?.find((d) => d.id === id)?.name || "";

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Job Openings"
        description="Manage open positions and recruitment"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Recruitment", href: "/app/hr/recruitment" },
          { label: "Job Openings" },
        ]}
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingJob ? "Edit" : "Create"} Job Opening</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Senior Consultant - Cardiology"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={formData.department_id} onValueChange={(v) => setFormData({ ...formData, department_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments?.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Designation</Label>
                    <Select value={formData.designation_id} onValueChange={(v) => setFormData({ ...formData, designation_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        {designations?.map((des) => (
                          <SelectItem key={des.id} value={des.id}>
                            {des.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Employment Type</Label>
                    <Select value={formData.employment_type} onValueChange={(v) => setFormData({ ...formData, employment_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYMENT_TYPES.map((et) => (
                          <SelectItem key={et.value} value={et.value}>
                            {et.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Positions</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.positions_available}
                      onChange={(e) => setFormData({ ...formData, positions_available: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience Required</Label>
                    <Input
                      value={formData.experience_required}
                      onChange={(e) => setFormData({ ...formData, experience_required: e.target.value })}
                      placeholder="e.g., 3-5 years"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Salary Min (Rs.)</Label>
                    <Input
                      type="number"
                      value={formData.salary_range_min}
                      onChange={(e) => setFormData({ ...formData, salary_range_min: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Salary Max (Rs.)</Label>
                    <Input
                      type="number"
                      value={formData.salary_range_max}
                      onChange={(e) => setFormData({ ...formData, salary_range_max: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Main Hospital, Lahore"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Closes At</Label>
                    <Input
                      type="date"
                      value={formData.closes_at}
                      onChange={(e) => setFormData({ ...formData, closes_at: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Job Description</Label>
                  <Textarea
                    value={formData.job_description}
                    onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                    placeholder="Describe the role and responsibilities..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Requirements</Label>
                  <Textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="List qualifications, skills, licenses required..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Benefits</Label>
                  <Textarea
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    placeholder="Health insurance, housing allowance, etc..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createJob.isPending || updateJob.isPending}>
                    {(createJob.isPending || updateJob.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingJob ? "Update" : "Post"} Job
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Openings</p>
                <p className="text-2xl font-bold">{jobs?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold">{openJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Filled</p>
                <p className="text-2xl font-bold">{filledJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Positions</p>
                <p className="text-2xl font-bold">{jobs?.reduce((sum, j) => sum + (j.positions_available || 0), 0) || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Job Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription>
                      {getDepartmentName(job.department_id || "")} • {getDesignationName(job.designation_id || "")}
                    </CardDescription>
                  </div>
                  {getStatusBadge(job.status)}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{job.positions_available} position(s)</span>
                  </div>
                  {job.experience_required && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{job.experience_required} experience</span>
                    </div>
                  )}
                  {(job.salary_range_min || job.salary_range_max) && (
                    <div className="text-muted-foreground">
                      Rs. {job.salary_range_min?.toLocaleString() || 0} - {job.salary_range_max?.toLocaleString() || 0}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-muted-foreground">
                    {job.closes_at ? `Closes ${format(new Date(job.closes_at), "MMM d")}` : "No deadline"}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(job)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No job openings found. Click "Post Job" to create one.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

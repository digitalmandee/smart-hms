import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, FileText, UserCheck, Clock, Loader2, Eye, ChevronRight } from "lucide-react";
import { useJobApplications, useCreateJobApplication, useUpdateJobApplication, useJobOpenings } from "@/hooks/useRecruitment";
import { format } from "date-fns";

const STATUS_OPTIONS = [
  { value: "received", label: "Received" },
  { value: "screening", label: "Screening" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

export default function ApplicationsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    job_opening_id: "",
    applicant_name: "",
    email: "",
    phone: "",
    cnic: "",
    experience_years: 0,
    current_employer: "",
    current_designation: "",
    expected_salary: 0,
    cover_letter: "",
    skills: "",
  });

  const { data: applications, isLoading } = useJobApplications({
    jobOpeningId: jobFilter !== "all" ? jobFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const filteredApplications = applications;
  const { data: jobs } = useJobOpenings("open");
  const createApplication = useCreateJobApplication();
  const updateApplication = useUpdateJobApplication();

  const receivedCount = filteredApplications?.filter((a) => a.status === "received").length || 0;
  const interviewCount = filteredApplications?.filter((a) => a.status === "interview").length || 0;
  const hiredCount = filteredApplications?.filter((a) => a.status === "hired").length || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createApplication.mutateAsync({
        job_opening_id: formData.job_opening_id,
        applicant_name: formData.applicant_name,
        email: formData.email,
        phone: formData.phone,
        cnic: formData.cnic,
        experience_years: formData.experience_years,
        current_employer: formData.current_employer,
        current_designation: formData.current_designation,
        expected_salary: formData.expected_salary,
        cover_letter: formData.cover_letter,
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by hook
    }
  };

  const resetForm = () => {
    setFormData({
      job_opening_id: "",
      applicant_name: "",
      email: "",
      phone: "",
      cnic: "",
      experience_years: 0,
      current_employer: "",
      current_designation: "",
      expected_salary: 0,
      cover_letter: "",
      skills: "",
    });
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await updateApplication.mutateAsync({ id: applicationId, status: newStatus });
    } catch (error) {
      // Error handled by hook
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      received: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      screening: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      interview: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      offer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      hired: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      withdrawn: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return <Badge className={colors[status] || ""}>{status}</Badge>;
  };

  const getJobTitle = (id: string) => jobs?.find((j) => j.id === id)?.title || "Unknown Position";

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Job Applications"
        description="Review and manage candidate applications"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Recruitment", href: "/app/hr/recruitment" },
          { label: "Applications" },
        ]}
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Job Application</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Job Position *</Label>
                  <Select value={formData.job_opening_id} onValueChange={(v) => setFormData({ ...formData, job_opening_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs?.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={formData.applicant_name}
                      onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CNIC</Label>
                    <Input
                      value={formData.cnic}
                      onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                      placeholder="XXXXX-XXXXXXX-X"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Experience (Years)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Employer</Label>
                    <Input
                      value={formData.current_employer}
                      onChange={(e) => setFormData({ ...formData, current_employer: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Designation</Label>
                    <Input
                      value={formData.current_designation}
                      onChange={(e) => setFormData({ ...formData, current_designation: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Expected Salary (Rs.)</Label>
                  <Input
                    type="number"
                    value={formData.expected_salary}
                    onChange={(e) => setFormData({ ...formData, expected_salary: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Skills (comma-separated)</Label>
                  <Input
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g., Surgery, Emergency Care, ICU"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cover Letter / Notes</Label>
                  <Textarea
                    value={formData.cover_letter}
                    onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createApplication.isPending}>
                    {createApplication.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Application
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
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{applications?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New / Received</p>
                <p className="text-2xl font-bold">{receivedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Interview</p>
                <p className="text-2xl font-bold">{interviewCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hired</p>
                <p className="text-2xl font-bold">{hiredCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {jobs?.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Expected Salary</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : applications && applications.length > 0 ? (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.applicant_name}</p>
                        <p className="text-sm text-muted-foreground">{app.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getJobTitle(app.job_opening_id)}</TableCell>
                    <TableCell>{app.experience_years || 0} years</TableCell>
                    <TableCell>Rs. {app.expected_salary?.toLocaleString() || 0}</TableCell>
                    <TableCell>{format(new Date(app.applied_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Select
                        value={app.status}
                        onValueChange={(v) => handleStatusChange(app.id, v)}
                      >
                        <SelectTrigger className="w-[130px] h-8">
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
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedApplication(app)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No applications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedApplication.applicant_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p>{selectedApplication.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p>{selectedApplication.phone || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">CNIC</Label>
                  <p>{selectedApplication.cnic || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Experience</Label>
                  <p>{selectedApplication.experience_years || 0} years</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Expected Salary</Label>
                  <p>Rs. {selectedApplication.expected_salary?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Current Employer</Label>
                  <p>{selectedApplication.current_employer || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Current Designation</Label>
                  <p>{selectedApplication.current_designation || "-"}</p>
                </div>
              </div>
              {selectedApplication.skills?.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Skills</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedApplication.skills.map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedApplication.cover_letter && (
                <div>
                  <Label className="text-muted-foreground">Cover Letter</Label>
                  <p className="text-sm mt-1">{selectedApplication.cover_letter}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

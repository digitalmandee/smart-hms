import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { useResignations, useExitInterviews, useCreateExitInterview } from "@/hooks/useExitManagement";
import { useEmployees } from "@/hooks/useHR";
import { Plus, Star, ThumbsUp, ThumbsDown, MessageSquare, Calendar } from "lucide-react";
import { format } from "date-fns";

const REASONS = [
  "Better Opportunity",
  "Career Growth",
  "Compensation",
  "Work-Life Balance",
  "Relocation",
  "Personal Reasons",
  "Health Issues",
  "Management Issues",
  "Work Environment",
  "Other",
];

export default function ExitInterviewsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResignation, setSelectedResignation] = useState<string>("");

  const { data: interviews, isLoading } = useExitInterviews();
  const { data: resignations } = useResignations("accepted");
  const { data: employees } = useEmployees();
  const createInterview = useCreateExitInterview();

  const [formData, setFormData] = useState({
    interview_date: new Date().toISOString().split("T")[0],
    rating_management: 3,
    rating_work_environment: 3,
    rating_compensation: 3,
    rating_growth_opportunities: 3,
    rating_work_life_balance: 3,
    primary_reason_leaving: "",
    what_liked_most: "",
    what_could_improve: "",
    would_recommend: false,
    would_rejoin: false,
    suggestions: "",
    additional_comments: "",
  });

  const getEmployeeName = (employeeId: string) => {
    const emp = employees?.find((e) => e.id === employeeId);
    return emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
  };

  const getResignationEmployee = (resignationId: string) => {
    const r = resignations?.find((res) => res.id === resignationId);
    return r ? getEmployeeName(r.employee_id) : "Unknown";
  };

  const handleSubmit = async () => {
    if (!selectedResignation) return;
    await createInterview.mutateAsync({
      resignation_id: selectedResignation,
      ...formData,
      status: "completed",
    });
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      interview_date: new Date().toISOString().split("T")[0],
      rating_management: 3, rating_work_environment: 3, rating_compensation: 3,
      rating_growth_opportunities: 3, rating_work_life_balance: 3,
      primary_reason_leaving: "", what_liked_most: "", what_could_improve: "",
      would_recommend: false, would_rejoin: false, suggestions: "", additional_comments: "",
    });
    setSelectedResignation("");
  };

  const RatingInput = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-1 mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => onChange(star)}
            className={`p-1 ${star <= value ? "text-amber-500" : "text-muted-foreground"}`}>
            <Star className="h-5 w-5" fill={star <= value ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
    </div>
  );

  // Stats
  const avgManagement = interviews?.length ? (interviews.reduce((sum, i) => sum + (i.rating_management || 0), 0) / interviews.length).toFixed(1) : "0";
  const recommendRate = interviews?.length ? Math.round((interviews.filter((i) => i.would_recommend).length / interviews.length) * 100) : 0;
  const rejoinRate = interviews?.length ? Math.round((interviews.filter((i) => i.would_rejoin).length / interviews.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exit Interviews"
        description="Conduct and track exit interviews for departing employees"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Exit Management" },
          { label: "Exit Interviews" },
        ]}
        actions={
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Interview
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{interviews?.length || 0}</div>
                <p className="text-muted-foreground text-sm">Total Interviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Star className="h-8 w-8 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">{avgManagement}/5</div>
                <p className="text-muted-foreground text-sm">Avg. Management Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <ThumbsUp className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{recommendRate}%</div>
                <p className="text-muted-foreground text-sm">Would Recommend</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <ThumbsUp className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{rejoinRate}%</div>
                <p className="text-muted-foreground text-sm">Would Rejoin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interviews Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Interview Date</TableHead>
                  <TableHead>Primary Reason</TableHead>
                  <TableHead>Avg Rating</TableHead>
                  <TableHead>Would Recommend</TableHead>
                  <TableHead>Would Rejoin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews?.map((interview) => {
                  const avgRating = ((interview.rating_management || 0) + (interview.rating_work_environment || 0) +
                    (interview.rating_compensation || 0) + (interview.rating_growth_opportunities || 0) +
                    (interview.rating_work_life_balance || 0)) / 5;

                  return (
                    <TableRow key={interview.id}>
                      <TableCell className="font-medium">
                        {getResignationEmployee(interview.resignation_id)}
                      </TableCell>
                      <TableCell>
                        {interview.interview_date ? format(new Date(interview.interview_date), "dd MMM yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{interview.primary_reason_leaving || "Not specified"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
                          {avgRating.toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {interview.would_recommend ? (
                          <Badge className="bg-green-100 text-green-800">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {interview.would_rejoin ? (
                          <Badge className="bg-blue-100 text-blue-800">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!interviews?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No exit interviews found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* New Interview Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conduct Exit Interview</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Employee Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Select Resignation</Label>
                <Select value={selectedResignation} onValueChange={setSelectedResignation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {resignations?.filter((r) => !interviews?.find((i) => i.resignation_id === r.id))
                      .map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {getEmployeeName(r.employee_id)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Interview Date</Label>
                <Input type="date" value={formData.interview_date}
                  onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })} />
              </div>
            </div>

            {/* Ratings */}
            <div>
              <h4 className="font-semibold mb-3">Ratings (1-5)</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <RatingInput label="Management" value={formData.rating_management}
                  onChange={(v) => setFormData({ ...formData, rating_management: v })} />
                <RatingInput label="Work Environment" value={formData.rating_work_environment}
                  onChange={(v) => setFormData({ ...formData, rating_work_environment: v })} />
                <RatingInput label="Compensation" value={formData.rating_compensation}
                  onChange={(v) => setFormData({ ...formData, rating_compensation: v })} />
                <RatingInput label="Growth Opportunities" value={formData.rating_growth_opportunities}
                  onChange={(v) => setFormData({ ...formData, rating_growth_opportunities: v })} />
                <RatingInput label="Work-Life Balance" value={formData.rating_work_life_balance}
                  onChange={(v) => setFormData({ ...formData, rating_work_life_balance: v })} />
              </div>
            </div>

            {/* Reason */}
            <div>
              <Label>Primary Reason for Leaving</Label>
              <Select value={formData.primary_reason_leaving}
                onValueChange={(v) => setFormData({ ...formData, primary_reason_leaving: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Feedback */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>What did you like most about working here?</Label>
                <Textarea value={formData.what_liked_most}
                  onChange={(e) => setFormData({ ...formData, what_liked_most: e.target.value })} />
              </div>
              <div>
                <Label>What could we improve?</Label>
                <Textarea value={formData.what_could_improve}
                  onChange={(e) => setFormData({ ...formData, what_could_improve: e.target.value })} />
              </div>
              <div>
                <Label>Suggestions for the organization</Label>
                <Textarea value={formData.suggestions}
                  onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })} />
              </div>
            </div>

            {/* Boolean Questions */}
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <Checkbox checked={formData.would_recommend}
                  onCheckedChange={(c) => setFormData({ ...formData, would_recommend: !!c })} />
                <Label>Would recommend to others</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={formData.would_rejoin}
                  onCheckedChange={(c) => setFormData({ ...formData, would_rejoin: !!c })} />
                <Label>Would rejoin in future</Label>
              </div>
            </div>

            {/* Additional Comments */}
            <div>
              <Label>Additional Comments</Label>
              <Textarea value={formData.additional_comments}
                onChange={(e) => setFormData({ ...formData, additional_comments: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!selectedResignation || createInterview.isPending}>
              Save Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

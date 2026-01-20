import { useParams, useNavigate } from "react-router-dom";
import { format, differenceInDays, parseISO } from "date-fns";
import { 
  ArrowLeft, 
  Bed, 
  User, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Wrench,
  ArrowRightLeft,
  Plus,
  Activity,
  TrendingUp,
  FileText,
  Edit,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useBedProfile, 
  useBedOccupancyHistory, 
  useBedTransferHistory, 
  useBedIssueLogs,
  useBedUtilizationStats 
} from "@/hooks/useBedProfile";
import { BedStatusBadge } from "@/components/ipd/BedStatusBadge";
import { LogBedIssueDialog } from "@/components/ipd/LogBedIssueDialog";
import { ResolveBedIssueDialog } from "@/components/ipd/ResolveBedIssueDialog";
import { useState } from "react";

export default function BedProfilePage() {
  const { bedId } = useParams<{ bedId: string }>();
  const navigate = useNavigate();
  const [logIssueOpen, setLogIssueOpen] = useState(false);
  const [resolveIssueId, setResolveIssueId] = useState<string | null>(null);

  const { data: bed, isLoading: bedLoading } = useBedProfile(bedId);
  const { data: occupancyHistory, isLoading: historyLoading } = useBedOccupancyHistory(bedId);
  const { data: transferHistory } = useBedTransferHistory(bedId);
  const { data: issueLogs, isLoading: issuesLoading } = useBedIssueLogs(bedId);
  const { data: utilization } = useBedUtilizationStats(bedId, 30);

  if (bedLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (!bed) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Bed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold">Bed not found</h2>
          <p className="text-muted-foreground">The requested bed could not be found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/app/ipd/beds")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Beds
          </Button>
        </div>
      </div>
    );
  }

  const currentAdmission = bed.current_admission;
  const activeIssues = issueLogs?.filter((i) => !i.resolved_at) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/ipd/beds")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Bed {bed.bed_number}</h1>
              <BedStatusBadge status={bed.status} />
            </div>
            <p className="text-muted-foreground">
              {bed.ward?.name} • {bed.bed_type || "Standard"} Bed
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/app/ipd/beds/${bedId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" /> Edit Bed
          </Button>
          <Button variant="outline" onClick={() => setLogIssueOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Log Issue
          </Button>
          {bed.status === "available" && (
            <Button onClick={() => navigate(`/app/ipd/admissions/new?bedId=${bedId}&wardId=${bed.ward_id}`)}>
              <User className="h-4 w-4 mr-2" /> Admit Patient
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Current Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            {bed.status === "occupied" && currentAdmission ? (
              <div>
                <p className="font-semibold">
                  {currentAdmission.patient?.first_name} {currentAdmission.patient?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  MR# {currentAdmission.patient?.patient_number}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Since {format(parseISO(currentAdmission.admission_date), "MMM d, yyyy")}
                </p>
              </div>
            ) : (
              <p className="font-medium capitalize">{bed.status}</p>
            )}
            {bed.notes && (
              <p className="text-sm text-muted-foreground mt-2">{bed.notes}</p>
            )}
          </CardContent>
        </Card>

        {/* Utilization */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy Rate (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{utilization?.occupancyRate.toFixed(0) || 0}%</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              {utilization?.totalAdmissions || 0} admissions
            </p>
          </CardContent>
        </Card>

        {/* Avg Stay */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Length of Stay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{utilization?.avgLengthOfStay.toFixed(1) || 0}</span>
              <span className="text-muted-foreground">days</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Issues */}
        <Card className={activeIssues.length > 0 ? "border-yellow-500" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{activeIssues.length}</span>
              {activeIssues.length > 0 && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
            </div>
            {activeIssues.length > 0 && (
              <p className="text-sm text-muted-foreground">{activeIssues[0]?.issue_type}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">
            <Activity className="h-4 w-4 mr-2" /> Occupancy History
          </TabsTrigger>
          <TabsTrigger value="transfers">
            <ArrowRightLeft className="h-4 w-4 mr-2" /> Transfers
          </TabsTrigger>
          <TabsTrigger value="issues">
            <Wrench className="h-4 w-4 mr-2" /> Issue Log
            {activeIssues.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 justify-center">
                {activeIssues.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Occupancy History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy History</CardTitle>
              <CardDescription>Past and current patients who occupied this bed</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : occupancyHistory && occupancyHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>MR#</TableHead>
                      <TableHead>Admission Date</TableHead>
                      <TableHead>Discharge Date</TableHead>
                      <TableHead>LOS</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {occupancyHistory.map((admission: any) => {
                      const admitDate = parseISO(admission.admission_date);
                      const dischargeDate = admission.actual_discharge_date 
                        ? parseISO(admission.actual_discharge_date)
                        : null;
                      const los = dischargeDate 
                        ? differenceInDays(dischargeDate, admitDate)
                        : differenceInDays(new Date(), admitDate);
                      
                      return (
                        <TableRow 
                          key={admission.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/app/ipd/admissions/${admission.id}`)}
                        >
                          <TableCell className="font-medium">
                            {admission.patient?.first_name} {admission.patient?.last_name}
                          </TableCell>
                          <TableCell>{admission.patient?.patient_number}</TableCell>
                          <TableCell>
                            {format(admitDate, "MMM d, yyyy")}
                            <span className="text-muted-foreground ml-1">
                              {admission.admission_time}
                            </span>
                          </TableCell>
                          <TableCell>
                            {dischargeDate 
                              ? format(dischargeDate, "MMM d, yyyy")
                              : <Badge variant="outline">In Progress</Badge>
                            }
                          </TableCell>
                          <TableCell>{los} days</TableCell>
                          <TableCell>
                            {admission.attending_doctor?.profile?.full_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant={admission.status === "active" ? "default" : "secondary"}>
                              {admission.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No occupancy history for this bed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers">
          <Card>
            <CardHeader>
              <CardTitle>Transfer History</CardTitle>
              <CardDescription>Patient transfers involving this bed</CardDescription>
            </CardHeader>
            <CardContent>
              {transferHistory && transferHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Ordered By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transferHistory.map((transfer: any) => (
                      <TableRow key={transfer.id}>
                        <TableCell>
                          {transfer.transferred_at 
                            ? format(parseISO(transfer.transferred_at), "MMM d, yyyy HH:mm")
                            : "-"
                          }
                        </TableCell>
                        <TableCell className="font-medium">
                          {transfer.admission?.patient?.first_name} {transfer.admission?.patient?.last_name}
                        </TableCell>
                        <TableCell>
                          {transfer.from_bed ? (
                            <span>
                              {transfer.from_bed.bed_number}
                              <span className="text-muted-foreground ml-1">
                                ({transfer.from_bed.ward?.name})
                              </span>
                            </span>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          {transfer.to_bed.bed_number}
                          <span className="text-muted-foreground ml-1">
                            ({transfer.to_bed.ward?.name})
                          </span>
                        </TableCell>
                        <TableCell>{transfer.transfer_reason || "-"}</TableCell>
                        <TableCell>
                          {transfer.ordered_by_profile?.full_name}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <ArrowRightLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No transfer history for this bed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Issue Log</CardTitle>
                <CardDescription>Maintenance and issue history for this bed</CardDescription>
              </div>
              <Button onClick={() => setLogIssueOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Log Issue
              </Button>
            </CardHeader>
            <CardContent>
              {issuesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : issueLogs && issueLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reported</TableHead>
                      <TableHead>Resolved</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issueLogs.map((issue: any) => (
                      <TableRow key={issue.id}>
                        <TableCell>
                          {issue.resolved_at ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="h-3 w-3" /> Resolved
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" /> Open
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="capitalize">{issue.issue_type}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              issue.severity === "critical" ? "destructive" :
                              issue.severity === "high" ? "destructive" :
                              issue.severity === "medium" ? "default" : "secondary"
                            }
                          >
                            {issue.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{issue.description}</TableCell>
                        <TableCell>
                          <div>
                            {format(parseISO(issue.reported_at), "MMM d, yyyy")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {issue.reported_by_profile?.full_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {issue.resolved_at ? (
                            <div>
                              {format(parseISO(issue.resolved_at), "MMM d, yyyy")}
                              <div className="text-sm text-muted-foreground">
                                {issue.resolved_by_profile?.full_name}
                              </div>
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          {!issue.resolved_at && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setResolveIssueId(issue.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Resolve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No issues logged for this bed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <LogBedIssueDialog 
        open={logIssueOpen} 
        onOpenChange={setLogIssueOpen}
        bedId={bedId!}
        bedNumber={bed.bed_number}
      />

      {resolveIssueId && (
        <ResolveBedIssueDialog
          open={!!resolveIssueId}
          onOpenChange={() => setResolveIssueId(null)}
          issueId={resolveIssueId}
          bedId={bedId!}
        />
      )}
    </div>
  );
}

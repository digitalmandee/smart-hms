import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Send, CheckCircle, Clock, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

type RosterType = "general" | "ot" | "emergency";
type RosterStatus = "draft" | "pending" | "published";

interface RosterPublishStatus {
  id: string;
  week_start: string;
  roster_type: RosterType;
  status: RosterStatus;
  published_at: string | null;
  submitted_at: string | null;
  submitted_by: string | null;
  notes: string | null;
}

export default function PublishRosterPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedRoster, setSelectedRoster] = useState<{ type: RosterType; status: RosterStatus } | null>(null);
  const [notes, setNotes] = useState("");

  const weekStart = format(currentWeekStart, "yyyy-MM-dd");

  // Fetch publish status for current week
  const { data: publishStatus, isLoading } = useQuery({
    queryKey: ["roster-publish-status", weekStart, profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roster_publish_status")
        .select("*")
        .eq("organization_id", profile?.organization_id)
        .eq("week_start", weekStart);
      
      if (error) throw error;
      return data as RosterPublishStatus[];
    },
    enabled: !!profile?.organization_id,
  });

  const publishMutation = useMutation({
    mutationFn: async ({ rosterType, action }: { rosterType: RosterType; action: "submit" | "publish" }) => {
      const existing = publishStatus?.find(p => p.roster_type === rosterType);
      
      if (existing) {
        const { error } = await supabase
          .from("roster_publish_status")
          .update({
            status: action === "publish" ? "published" : "pending",
            published_at: action === "publish" ? new Date().toISOString() : null,
            published_by: action === "publish" ? profile?.id : null,
            submitted_at: action === "submit" ? new Date().toISOString() : existing.submitted_at,
            submitted_by: action === "submit" ? profile?.id : existing.submitted_by,
            notes: notes || existing.notes,
          })
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("roster_publish_status")
          .insert({
            organization_id: profile?.organization_id,
            week_start: weekStart,
            roster_type: rosterType,
            status: action === "publish" ? "published" : "pending",
            published_at: action === "publish" ? new Date().toISOString() : null,
            published_by: action === "publish" ? profile?.id : null,
            submitted_at: action === "submit" ? new Date().toISOString() : null,
            submitted_by: action === "submit" ? profile?.id : null,
            notes,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roster-publish-status"] });
      toast.success("Roster status updated");
      setPublishDialogOpen(false);
      setNotes("");
    },
    onError: () => {
      toast.error("Failed to update roster status");
    },
  });

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeekStart(prev => 
      direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  const getRosterStatus = (type: RosterType): RosterStatus => {
    const status = publishStatus?.find(p => p.roster_type === type);
    return (status?.status as RosterStatus) || "draft";
  };

  const getStatusBadge = (status: RosterStatus) => {
    switch (status) {
      case "published":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle className="h-3 w-3 mr-1" /> Published</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800"><Clock className="h-3 w-3 mr-1" /> Pending Approval</Badge>;
      default:
        return <Badge variant="outline"><FileText className="h-3 w-3 mr-1" /> Draft</Badge>;
    }
  };

  const rosterTypes: { type: RosterType; name: string; path: string }[] = [
    { type: "general", name: "General Duty Roster", path: "/app/hr/attendance/roster" },
    { type: "ot", name: "OT Duty Roster", path: "/app/hr/attendance/ot-roster" },
    { type: "emergency", name: "Emergency Roster", path: "/app/hr/attendance/emergency-roster" },
  ];

  const handleAction = (type: RosterType, action: "submit" | "publish") => {
    setSelectedRoster({ type, status: getRosterStatus(type) });
    setPublishDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Publish Roster"
        description="Review and publish weekly staff rosters"
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Attendance", href: "/app/hr/attendance" },
          { label: "Publish Roster" },
        ]}
      />

      {/* Week Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <div className="text-lg font-semibold">
            Week of {format(currentWeekStart, "MMMM d, yyyy")}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(currentWeekStart, "MMM d")} - {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={() => navigateWeek("next")}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rosterTypes.map(roster => {
          const status = getRosterStatus(roster.type);
          return (
            <Card key={roster.type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {roster.name}
                  {getStatusBadge(status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  {status === "published" 
                    ? "Roster has been published and is visible to staff"
                    : status === "pending"
                    ? "Awaiting approval from HR Manager"
                    : "Roster is still being prepared"
                  }
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.location.href = roster.path}
                  >
                    View Roster
                  </Button>
                  {status === "draft" && (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleAction(roster.type, "submit")}
                    >
                      Submit
                    </Button>
                  )}
                  {status === "pending" && (
                    <Button 
                      size="sm" 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleAction(roster.type, "publish")}
                    >
                      Publish
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Publication History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Week</TableHead>
                <TableHead>Roster Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published At</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  </TableRow>
                ))
              ) : publishStatus?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No roster publications for this week yet
                  </TableCell>
                </TableRow>
              ) : (
                publishStatus?.map(status => (
                  <TableRow key={status.id}>
                    <TableCell>{format(new Date(status.week_start), "MMM d, yyyy")}</TableCell>
                    <TableCell className="capitalize">{status.roster_type} Roster</TableCell>
                    <TableCell>{getStatusBadge(status.status as RosterStatus)}</TableCell>
                    <TableCell>
                      {status.published_at 
                        ? format(new Date(status.published_at), "MMM d, yyyy HH:mm")
                        : "-"
                      }
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {status.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRoster?.status === "draft" ? "Submit Roster for Approval" : "Publish Roster"}
            </DialogTitle>
            <DialogDescription>
              {selectedRoster?.status === "draft" 
                ? "This will submit the roster for HR Manager approval."
                : "This will publish the roster and make it visible to all staff."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this roster..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedRoster) {
                  publishMutation.mutate({
                    rosterType: selectedRoster.type,
                    action: selectedRoster.status === "draft" ? "submit" : "publish",
                  });
                }
              }}
              disabled={publishMutation.isPending}
              className={selectedRoster?.status === "pending" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {publishMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedRoster?.status === "draft" ? (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Approval
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Publish Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

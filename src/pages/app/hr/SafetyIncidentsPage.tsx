import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

const SEVERITY_COLORS: Record<string, string> = {
  minor: "bg-blue-100 text-blue-800",
  moderate: "bg-yellow-100 text-yellow-800",
  severe: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function SafetyIncidentsPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [incidentType, setIncidentType] = useState("other");
  const [severity, setSeverity] = useState("minor");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [actionTaken, setActionTaken] = useState("");

  const { data: incidents } = useQuery({
    queryKey: ["safety-incidents", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("safety_incidents")
        .select("*, reported_by_profile:profiles!safety_incidents_reported_by_fkey(full_name)")
        .eq("organization_id", profile!.organization_id)
        .order("incident_date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("safety_incidents").insert({
        organization_id: profile!.organization_id,
        incident_date: format(new Date(), "yyyy-MM-dd"),
        incident_type: incidentType,
        severity,
        description,
        location,
        action_taken: actionTaken,
        reported_by: profile!.id,
        status: "reported",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety-incidents"] });
      toast.success("Incident reported");
      setOpen(false);
      setDescription("");
      setLocation("");
      setActionTaken("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.safetyIncidents")}
        description={t("nav.safetyIncidentsDesc")}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />{t("nav.reportIncident")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{t("nav.reportIncident")}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={incidentType} onValueChange={setIncidentType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slip_fall">Slip/Fall</SelectItem>
                        <SelectItem value="forklift">Forklift</SelectItem>
                        <SelectItem value="hazmat">Hazmat</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Severity</Label>
                    <Select value={severity} onValueChange={setSeverity}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minor">Minor</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Zone / Bin / Area" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div>
                  <Label>Action Taken</Label>
                  <Textarea value={actionTaken} onChange={e => setActionTaken(e.target.value)} />
                </div>
                <Button className="w-full" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                  {t("nav.reportIncident")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>{t("common.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents?.map((inc: any) => (
                <TableRow key={inc.id}>
                  <TableCell>{format(new Date(inc.incident_date), "dd MMM yyyy")}</TableCell>
                  <TableCell><Badge variant="outline">{inc.incident_type.replace("_", " ")}</Badge></TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs font-medium ${SEVERITY_COLORS[inc.severity] || ""}`}>{inc.severity}</span></TableCell>
                  <TableCell>{inc.location || "—"}</TableCell>
                  <TableCell>{inc.reported_by_profile?.full_name || "—"}</TableCell>
                  <TableCell><Badge variant={inc.status === "resolved" ? "default" : "secondary"}>{inc.status}</Badge></TableCell>
                </TableRow>
              ))}
              {(!incidents || incidents.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No safety incidents reported
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
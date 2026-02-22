import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, ArrowRightLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ShiftHandoverPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [shiftType, setShiftType] = useState("morning");
  const [pendingReceipts, setPendingReceipts] = useState("");
  const [pendingDispatches, setPendingDispatches] = useState("");
  const [issuesNotes, setIssuesNotes] = useState("");

  const { data: handovers, isLoading } = useQuery({
    queryKey: ["shift-handovers", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("shift_handovers")
        .select("*, handed_over_by_profile:profiles!shift_handovers_handed_over_by_fkey(full_name)")
        .eq("organization_id", profile!.organization_id)
        .order("shift_date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("shift_handovers").insert({
        organization_id: profile!.organization_id,
        store_id: defaultStoreId,
        shift_date: format(new Date(), "yyyy-MM-dd"),
        shift_type: shiftType,
        handed_over_by: profile!.id,
        pending_receipts: pendingReceipts,
        pending_dispatches: pendingDispatches,
        issues_notes: issuesNotes,
        status: "completed",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shift-handovers"] });
      toast.success(t("common.save") + " ✓");
      setOpen(false);
      setPendingReceipts("");
      setPendingDispatches("");
      setIssuesNotes("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.shiftHandover")}
        description={t("nav.shiftHandoverDesc")}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />{t("nav.newHandover")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{t("nav.newHandover")}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t("nav.shiftType")}</Label>
                  <Select value={shiftType} onValueChange={setShiftType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("nav.pendingReceipts")}</Label>
                  <Textarea value={pendingReceipts} onChange={e => setPendingReceipts(e.target.value)} />
                </div>
                <div>
                  <Label>{t("nav.pendingDispatches")}</Label>
                  <Textarea value={pendingDispatches} onChange={e => setPendingDispatches(e.target.value)} />
                </div>
                <div>
                  <Label>{t("nav.issuesNotes")}</Label>
                  <Textarea value={issuesNotes} onChange={e => setIssuesNotes(e.target.value)} />
                </div>
                <Button className="w-full" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                  {t("common.save")}
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
                <TableHead>{t("nav.shiftType")}</TableHead>
                <TableHead>Handed Over By</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("nav.issuesNotes")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {handovers?.map((h: any) => (
                <TableRow key={h.id}>
                  <TableCell>{format(new Date(h.shift_date), "dd MMM yyyy")}</TableCell>
                  <TableCell><Badge variant="outline">{h.shift_type}</Badge></TableCell>
                  <TableCell>{h.handed_over_by_profile?.full_name || "—"}</TableCell>
                  <TableCell><Badge variant={h.status === "completed" ? "default" : "secondary"}>{h.status}</Badge></TableCell>
                  <TableCell className="max-w-[200px] truncate">{h.issues_notes || "—"}</TableCell>
                </TableRow>
              ))}
              {(!handovers || handovers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <ArrowRightLeft className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No shift handovers yet
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

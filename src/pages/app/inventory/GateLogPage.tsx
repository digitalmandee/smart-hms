import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, DoorOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

export default function GateLogPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [purpose, setPurpose] = useState("delivery");

  const { data: logs } = useQuery({
    queryKey: ["gate-logs", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("gate_logs")
        .select("*")
        .eq("organization_id", profile!.organization_id)
        .order("entry_time", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("gate_logs").insert({
        organization_id: profile!.organization_id,
        vehicle_number: vehicleNumber,
        driver_name: driverName,
        purpose,
        logged_by: profile!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gate-logs"] });
      toast.success("Gate entry logged");
      setOpen(false);
      setVehicleNumber("");
      setDriverName("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markExit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("gate_logs").update({ exit_time: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gate-logs"] });
      toast.success("Exit recorded");
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.gateLog")}
        description={t("nav.gateLogDesc")}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Log Entry</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log Vehicle Entry</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Vehicle Number *</Label><Input value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} /></div>
                <div><Label>Driver Name</Label><Input value={driverName} onChange={e => setDriverName(e.target.value)} /></div>
                <div>
                  <Label>Purpose</Label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="pickup">Pickup</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => createMutation.mutate()} disabled={!vehicleNumber || createMutation.isPending}>
                  Log Entry
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
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Exit</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.vehicle_number}</TableCell>
                  <TableCell>{log.driver_name || "—"}</TableCell>
                  <TableCell><Badge variant="outline">{log.purpose}</Badge></TableCell>
                  <TableCell>{format(new Date(log.entry_time), "dd MMM HH:mm")}</TableCell>
                  <TableCell>{log.exit_time ? format(new Date(log.exit_time), "dd MMM HH:mm") : <Badge variant="secondary">On-site</Badge>}</TableCell>
                  <TableCell>
                    {!log.exit_time && (
                      <Button size="sm" variant="outline" onClick={() => markExit.mutate(log.id)}>Mark Exit</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(!logs || logs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <DoorOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />No gate logs
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
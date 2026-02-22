import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Truck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";

export default function DockSchedulePage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [dockNumber, setDockNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [appointmentType, setAppointmentType] = useState("inbound");
  const [scheduledTime, setScheduledTime] = useState("");

  const { data: appointments } = useQuery({
    queryKey: ["dock-appointments", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("dock_appointments")
        .select("*")
        .eq("organization_id", profile!.organization_id)
        .order("scheduled_time", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("dock_appointments").insert({
        organization_id: profile!.organization_id,
        store_id: defaultStoreId,
        dock_number: dockNumber,
        vehicle_number: vehicleNumber,
        driver_name: driverName,
        appointment_type: appointmentType,
        scheduled_time: scheduledTime || new Date().toISOString(),
        created_by: profile!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dock-appointments"] });
      toast.success("Dock appointment created");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, field }: { id: string; status: string; field?: string }) => {
      const update: any = { status };
      if (field) update[field] = new Date().toISOString();
      const { error } = await (supabase as any).from("dock_appointments").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dock-appointments"] });
      toast.success("Updated");
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.dockSchedule")}
        description={t("nav.dockScheduleDesc")}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />New Appointment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Dock Appointment</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={appointmentType} onValueChange={setAppointmentType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inbound">Inbound</SelectItem>
                        <SelectItem value="outbound">Outbound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Dock #</Label><Input value={dockNumber} onChange={e => setDockNumber(e.target.value)} /></div>
                  <div><Label>Vehicle #</Label><Input value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} /></div>
                  <div><Label>Driver</Label><Input value={driverName} onChange={e => setDriverName(e.target.value)} /></div>
                </div>
                <div><Label>Scheduled Time</Label><Input type="datetime-local" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} /></div>
                <Button className="w-full" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>Create</Button>
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
                <TableHead>Dock</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments?.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.dock_number || "—"}</TableCell>
                  <TableCell><Badge variant="outline">{a.appointment_type}</Badge></TableCell>
                  <TableCell>{a.vehicle_number || "—"}</TableCell>
                  <TableCell>{a.driver_name || "—"}</TableCell>
                  <TableCell>{a.scheduled_time ? format(new Date(a.scheduled_time), "dd MMM HH:mm") : "—"}</TableCell>
                  <TableCell><Badge>{a.status}</Badge></TableCell>
                  <TableCell>
                    {a.status === "scheduled" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: a.id, status: "arrived", field: "actual_arrival" })}>
                        Arrived
                      </Button>
                    )}
                    {a.status === "arrived" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: a.id, status: "completed", field: "actual_departure" })}>
                        Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(!appointments || appointments.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />No dock appointments
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

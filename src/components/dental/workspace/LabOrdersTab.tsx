import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useDentalT } from "@/lib/dental/i18n";
import { useDentalLabOrders, useSaveDentalLabOrder } from "@/hooks/useDentalWorkspace";

const WORK_TYPES = ["Crown", "Bridge", "Veneer", "Inlay/Onlay", "Partial denture", "Complete denture", "Implant crown", "Night guard", "Retainer", "Aligner"];
const STATUSES = ["draft", "sent", "in_lab", "received", "fitted", "remake", "cancelled"];

export default function LabOrdersTab({ patientId }: { patientId: string }) {
  const { dt } = useDentalT();
  const { data: orders } = useDentalLabOrders(patientId);
  const save = useSaveDentalLabOrder();

  const [form, setForm] = useState<any>({ work_type: "Crown", status: "draft" });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="h-fit">
        <CardHeader className="pb-3"><CardTitle className="text-base">{dt("dw.newRecord")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">{dt("dw.f.labName")}</Label>
            <Input value={form.lab_name || ""} onChange={(e) => set("lab_name", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{dt("dw.f.workType")}</Label>
            <Select value={form.work_type} onValueChange={(v) => set("work_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{WORK_TYPES.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">{dt("dw.f.teeth")}</Label>
              <Input value={form.tooth_numbers || ""} onChange={(e) => set("tooth_numbers", e.target.value)} placeholder="36" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{dt("dw.f.shade")}</Label>
              <Input value={form.shade || ""} onChange={(e) => set("shade", e.target.value)} placeholder="A2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">{dt("dw.f.sentDate")}</Label>
              <Input type="date" value={form.sent_date || ""} onChange={(e) => set("sent_date", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{dt("dw.f.dueDate")}</Label>
              <Input type="date" value={form.due_date || ""} onChange={(e) => set("due_date", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{dt("dw.f.cost")}</Label>
            <Input type="number" value={form.cost || ""} onChange={(e) => set("cost", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{dt("dw.f.instructions")}</Label>
            <Textarea rows={3} value={form.instructions || ""} onChange={(e) => set("instructions", e.target.value)} />
          </div>
          <Button
            className="w-full gap-1.5"
            onClick={() =>
              save.mutate(
                { ...form, cost: Number(form.cost) || 0, patient_id: patientId },
                { onSuccess: () => setForm({ work_type: "Crown", status: "draft" }) }
              )
            }
          >
            <Plus className="h-4 w-4" /> {dt("dw.save")}
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3"><CardTitle className="text-base">{dt("dw.tab.lab")}</CardTitle></CardHeader>
        <CardContent>
          {!orders?.length ? (
            <p className="text-sm text-muted-foreground">{dt("dw.noRecords")}</p>
          ) : (
            <div className="space-y-2">
              {orders.map((o: any) => (
                <div key={o.id} className="p-3 border rounded-lg space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{o.work_type}</span>
                    {o.tooth_numbers && <Badge variant="secondary">#{o.tooth_numbers}</Badge>}
                    {o.lab_name && <Badge variant="outline">{o.lab_name}</Badge>}
                    {o.shade && <Badge variant="outline">{o.shade}</Badge>}
                    <Select value={o.status} onValueChange={(v) => save.mutate({ id: o.id, patient_id: patientId, work_type: o.work_type, status: v })}>
                      <SelectTrigger className="w-32 h-8 ms-auto"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                    {o.sent_date && <span>{dt("dw.f.sentDate")}: {o.sent_date}</span>}
                    {o.due_date && <span>{dt("dw.f.dueDate")}: {o.due_date}</span>}
                    {o.received_date && <span>{dt("dw.f.receivedDate")}: {o.received_date}</span>}
                    {o.fitted_date && <span>{dt("dw.f.fittedDate")}: {o.fitted_date}</span>}
                    {!!Number(o.cost) && <span>{dt("dw.f.cost")}: {Number(o.cost).toFixed(2)}</span>}
                  </div>
                  {o.instructions && <p className="text-xs text-muted-foreground">{o.instructions}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

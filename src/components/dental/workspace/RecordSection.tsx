import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useDentalT } from "@/lib/dental/i18n";
import { useDentalRecords, useSaveDentalRecord, useDeleteDentalRecord } from "@/hooks/useDentalWorkspace";

export type FieldType = "text" | "number" | "date" | "textarea" | "checkbox" | "select";

export interface RecordField {
  name: string;
  labelKey: string;
  type: FieldType;
  options?: string[];
}

interface Props {
  patientId: string;
  recordType: string;
  titleKey: string;
  fields: RecordField[];
  withTooth?: boolean;
  statuses?: string[];
}

export default function RecordSection({
  patientId,
  recordType,
  titleKey,
  fields,
  withTooth = true,
  statuses = ["open", "in_progress", "completed"],
}: Props) {
  const { dt, isRTL } = useDentalT();
  const { data: records } = useDentalRecords(patientId, recordType);
  const save = useSaveDentalRecord();
  const del = useDeleteDentalRecord();

  const [form, setForm] = useState<Record<string, any>>({});
  const [tooth, setTooth] = useState("");
  const [recordDate, setRecordDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState(statuses[0]);
  const [notes, setNotes] = useState("");

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    save.mutate(
      {
        patient_id: patientId,
        record_type: recordType,
        tooth_number: tooth ? Number(tooth) : null,
        record_date: recordDate,
        status,
        data: form,
        notes: notes || null,
      },
      {
        onSuccess: () => {
          setForm({});
          setTooth("");
          setNotes("");
        },
      }
    );
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3" dir={isRTL ? "rtl" : "ltr"}>
      <Card className="lg:col-span-1 h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{dt("dw.newRecord")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">{dt("dw.date")}</Label>
              <Input type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} />
            </div>
            {withTooth && (
              <div className="space-y-1">
                <Label className="text-xs">{dt("dw.tooth")}</Label>
                <Input value={tooth} onChange={(e) => setTooth(e.target.value)} placeholder="36" />
              </div>
            )}
          </div>

          {fields.map((f) => (
            <div key={f.name} className="space-y-1">
              <Label className="text-xs">{dt(f.labelKey)}</Label>
              {f.type === "textarea" ? (
                <Textarea rows={2} value={form[f.name] || ""} onChange={(e) => set(f.name, e.target.value)} />
              ) : f.type === "checkbox" ? (
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox checked={!!form[f.name]} onCheckedChange={(v) => set(f.name, !!v)} />
                  <span className="text-xs text-muted-foreground">{dt(f.labelKey)}</span>
                </div>
              ) : f.type === "select" ? (
                <Select value={form[f.name] || ""} onValueChange={(v) => set(f.name, v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {(f.options || []).map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                  value={form[f.name] || ""}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
            </div>
          ))}

          <div className="space-y-1">
            <Label className="text-xs">{dt("dw.status")}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">{dt("dw.notes")}</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <Button className="w-full gap-1.5" onClick={submit} disabled={save.isPending}>
            <Plus className="h-4 w-4" /> {dt("dw.save")}
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{dt(titleKey)}</CardTitle>
        </CardHeader>
        <CardContent>
          {!records?.length ? (
            <p className="text-sm text-muted-foreground">{dt("dw.noRecords")}</p>
          ) : (
            <div className="space-y-2">
              {records.map((r: any) => (
                <div key={r.id} className="p-3 border rounded-lg space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{r.record_date}</span>
                    {r.tooth_number && <Badge variant="outline">#{r.tooth_number}</Badge>}
                    <Badge variant="secondary">{String(r.status).replace(/_/g, " ")}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ms-auto h-7 w-7 text-destructive"
                      onClick={() => del.mutate({ id: r.id, patient_id: patientId, record_type: recordType })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {fields
                      .filter((f) => r.data?.[f.name] !== undefined && r.data?.[f.name] !== "" && r.data?.[f.name] !== false)
                      .map((f) => (
                        <span key={f.name}>
                          <span className="font-medium text-foreground">{dt(f.labelKey)}:</span>{" "}
                          {typeof r.data[f.name] === "boolean" ? "✓" : String(r.data[f.name])}
                        </span>
                      ))}
                  </div>
                  {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Tent } from "lucide-react";
import { useBloodCamps, useSaveCamp } from "@/hooks/useBloodCamps";
import { useCampT } from "@/lib/blood-bank/camp-i18n";

export const campStatusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  planned: "outline", ongoing: "default", closed: "secondary", received: "secondary",
};

export default function CampsListPage() {
  const { tc, rtl } = useCampT();
  const nav = useNavigate();
  const { data: camps = [], isLoading } = useBloodCamps();
  const save = useSaveCamp();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", location: "", camp_date: new Date().toISOString().slice(0, 10), start_time: "09:00", end_time: "15:00", organiser: "", in_charge: "", target_bags: "50" });
  const end = rtl ? "text-end" : "";

  const submit = async () => {
    if (!f.name.trim()) return;
    const c = await save.mutateAsync({ ...f, target_bags: Number(f.target_bags) || 0 } as any);
    setOpen(false);
    if (c?.id) nav(`/app/blood-bank/camps/${c.id}`);
  };

  return (
    <div className="space-y-6" dir={rtl ? "rtl" : "ltr"}>
      <PageHeader title={tc("camps")} description={tc("campsDesc")}
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 me-2" />{tc("newCamp")}</Button>} />
      <Card><CardContent className="p-0">
        {isLoading ? <p className="p-6 text-muted-foreground">…</p> : camps.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground"><Tent className="h-10 w-10 mx-auto mb-2" />{tc("noCamps")}</div>
        ) : (
          <Table>
            <TableHeader><TableRow>
              <TableHead className={end}>#</TableHead><TableHead className={end}>{tc("name")}</TableHead><TableHead className={end}>{tc("location")}</TableHead>
              <TableHead className={end}>{tc("date")}</TableHead><TableHead className={end}>{tc("target")}</TableHead><TableHead className={end}>{tc("status")}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {camps.map((c) => (
                <TableRow key={c.id} className="cursor-pointer" onClick={() => nav(`/app/blood-bank/camps/${c.id}`)}>
                  <TableCell className={`font-mono text-xs ${end}`}>{c.camp_number}</TableCell>
                  <TableCell className={`font-medium ${end}`}>{c.name}</TableCell>
                  <TableCell className={end}>{c.location || "-"}</TableCell>
                  <TableCell className={end}>{c.camp_date}</TableCell>
                  <TableCell className={end}>{c.target_bags}</TableCell>
                  <TableCell className={end}><Badge variant={campStatusVariant[c.status]}>{tc(`st_${c.status}`)}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir={rtl ? "rtl" : "ltr"}>
          <DialogHeader><DialogTitle className={end}>{tc("newCamp")}</DialogTitle></DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            {([["name", "text"], ["location", "text"], ["camp_date", "date"], ["target_bags", "number"], ["start_time", "time"], ["end_time", "time"], ["organiser", "text"], ["in_charge", "text"]] as const).map(([k, type]) => (
              <div key={k} className="space-y-1">
                <Label className={`block ${end}`}>{tc(k === "camp_date" ? "date" : k === "target_bags" ? "target" : k === "start_time" ? "start" : k === "end_time" ? "end" : k === "in_charge" ? "inCharge" : k)}</Label>
                <Input type={type} value={(f as any)[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
              </div>
            ))}
          </div>
          <DialogFooter className={rtl ? "flex-row-reverse" : ""}>
            <Button variant="outline" onClick={() => setOpen(false)}>{tc("cancel")}</Button>
            <Button onClick={submit} disabled={save.isPending || !f.name.trim()}>{tc("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

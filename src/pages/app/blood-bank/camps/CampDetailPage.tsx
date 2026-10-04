import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Play, Lock, UserPlus, Trash2, Truck, CheckCircle2, AlertTriangle, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { addDays, format } from "date-fns";
import { useBloodCamp, useSaveCamp, useCampRow, useReceiveCampBags } from "@/hooks/useBloodCamps";
import { useCampT } from "@/lib/blood-bank/camp-i18n";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";
import { campStatusVariant } from "./CampsListPage";

const ROLES = ["doctor", "phlebotomist", "nurse", "driver", "volunteer"];
const REJECT_REASONS = ["damaged", "missing", "cold_chain", "clotted", "underfilled"];

export default function CampDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { tc, rtl } = useCampT();
  const { data, isLoading } = useBloodCamp(id);
  const save = useSaveCamp();
  const staffM = useCampRow("blood_camp_staff");
  const tripM = useCampRow("blood_camp_transport");
  const receive = useReceiveCampBags();
  const end = rtl ? "text-end" : "";
  const row = rtl ? "flex-row-reverse" : "";

  const [form, setForm] = useState<any>({});
  const [member, setMember] = useState({ name: "", role: "phlebotomist", phone: "" });
  const [trip, setTrip] = useState({ departed_at: "", departure_temp: "", arrived_at: "", arrival_temp: "", carrier: "", bag_count: "" });
  const [decision, setDecision] = useState<Record<string, string>>({}); // id -> "accept" | reason
  const camp = data?.camp;
  useEffect(() => { if (camp) setForm(camp); }, [camp]);

  const stats = useMemo(() => {
    const d = data?.donations || []; const u = data?.units || [];
    const collected = d.filter((x: any) => x.status !== "rejected" || x.received_status === "rejected").length;
    return {
      registered: d.length,
      deferred: d.filter((x: any) => x.eligibility_passed === false || (x.status === "rejected" && !x.received_status)).length,
      collected,
      accepted: d.filter((x: any) => x.received_status === "accepted").length,
      rejected: d.filter((x: any) => x.received_status === "rejected").length,
      leftover: Math.max(0, (camp?.bags_sent || 0) - collected),
      failed: u.filter((x: any) => x.discard_reason === "failed_screening").length,
      discarded: u.filter((x: any) => ["discarded", "expired"].includes(x.status)).length,
      issued: u.filter((x: any) => ["issued", "transfused"].includes(x.status)).length,
      stock: u.filter((x: any) => ["available", "quarantine", "reserved", "cross_matched"].includes(x.status)).length,
    };
  }, [data, camp]);

  const deferralReasons = useMemo(() => {
    const m: Record<string, number> = {};
    (data?.donations || []).forEach((d: any) => (d.eligibility_reasons || []).forEach((r: string) => { m[r] = (m[r] || 0) + 1; }));
    return Object.entries(m);
  }, [data]);

  if (isLoading) return <p className="p-6 text-muted-foreground">…</p>;
  if (!camp) return <p className="p-6 text-muted-foreground">-</p>;

  const pending = (data?.donations || []).filter((d: any) => d.status !== "rejected" && (d.received_status || "pending") === "pending");
  const editable = camp.status === "planned" || camp.status === "ongoing";

  const confirmReceipt = async () => {
    const accepted = pending.filter((d: any) => decision[d.id] === "accept").map((d: any) => d.id);
    const rejected = pending.filter((d: any) => decision[d.id] && decision[d.id] !== "accept").map((d: any) => ({ id: d.id, reason: decision[d.id] }));
    if (!accepted.length && !rejected.length) return;
    await receive.mutateAsync({ campId: camp.id, accepted, rejected });
    setDecision({});
    toast.success(tc("received"));
  };

  const thank = (d: any) => {
    const phone = (d.donor?.phone || "").replace(/\D/g, "");
    const msg = tc("thankMsg", { name: d.donor?.first_name || "", camp: camp.name, date: format(addDays(new Date(d.donation_date), 56), "dd MMM yyyy") });
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const fld = (k: string, label: string, type = "text") => (
    <div className="space-y-1">
      <Label className={`block ${end}`}>{tc(label)}</Label>
      <Input type={type} disabled={!editable} value={form[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
    </div>
  );

  const stat = (label: string, v: number) => (
    <Card><CardContent className={`p-4 ${end}`}><p className="text-xs text-muted-foreground">{tc(label)}</p><p className="text-2xl font-semibold">{v}</p></CardContent></Card>
  );

  return (
    <div className="space-y-6" dir={rtl ? "rtl" : "ltr"}>
      <PageHeader title={camp.name} description={`${camp.camp_number || ""} • ${camp.location || ""} • ${camp.camp_date}`}
        actions={
          <div className={`flex gap-2 ${row}`}>
            <Badge variant={campStatusVariant[camp.status]} className="self-center">{tc(`st_${camp.status}`)}</Badge>
            {camp.status === "planned" && <Button onClick={() => save.mutate({ id: camp.id, status: "ongoing" })}><Play className="h-4 w-4 me-2" />{tc("startCamp")}</Button>}
            {camp.status === "ongoing" && <Button variant="secondary" onClick={() => save.mutate({ id: camp.id, status: "closed", closed_at: new Date().toISOString(), closing_notes: form.closing_notes || null } as any)}><Lock className="h-4 w-4 me-2" />{tc("closeCamp")}</Button>}
            <Button variant="outline" onClick={() => nav("/app/blood-bank/camps")}><ArrowLeft className="h-4 w-4 me-2" />{tc("camps")}</Button>
          </div>
        } />

      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        {stat("registered", stats.registered)}{stat("deferred", stats.deferred)}{stat("collected", stats.collected)}{stat("accepted", stats.accepted)}{stat("issued", stats.issued)}
      </div>

      <Tabs defaultValue={camp.status === "ongoing" ? "donors" : camp.status === "closed" ? "receiving" : "details"}>
        <TabsList className="flex-wrap h-auto">
          {["details", "team", "donors", "transport", "receiving", "report"].map((t) => (
            <TabsTrigger key={t} value={t}>{tc(`tab${t[0].toUpperCase()}${t.slice(1)}`)}{t === "receiving" && pending.length > 0 && camp.status !== "planned" ? ` (${pending.length})` : ""}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="details">
          <Card><CardContent className="grid gap-3 md:grid-cols-3 pt-6">
            {fld("name", "name")}{fld("location", "location")}{fld("address", "address")}
            {fld("camp_date", "date", "date")}{fld("start_time", "start", "time")}{fld("end_time", "end", "time")}
            {fld("organiser", "organiser")}{fld("contact_person", "contact")}{fld("contact_phone", "phone")}
            {fld("in_charge", "inCharge")}{fld("target_bags", "target", "number")}
            <div className="md:col-span-3 space-y-1">
              <Label className={`block ${end}`}>{tc("closingNotes")}</Label>
              <Textarea rows={2} disabled={camp.status === "received"} value={form.closing_notes ?? ""} onChange={(e) => setForm({ ...form, closing_notes: e.target.value })} />
            </div>
            <div className={`md:col-span-3 flex ${rtl ? "justify-start" : "justify-end"}`}>
              <Button disabled={save.isPending} onClick={() => {
                const { id: _i, created_at, camp_number, ...rest } = form;
                save.mutate({ id: camp.id, ...rest, target_bags: Number(rest.target_bags) || 0, bags_sent: Number(rest.bags_sent) || 0 }, { onSuccess: () => toast.success("✓") });
              }}>{tc("save")}</Button>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card><CardContent className="pt-6 space-y-4">
            <div className="grid gap-3 md:grid-cols-4 items-end">
              <div className="space-y-1"><Label className={`block ${end}`}>{tc("name")}</Label><Input value={member.name} onChange={(e) => setMember({ ...member, name: e.target.value })} /></div>
              <div className="space-y-1"><Label className={`block ${end}`}>{tc("role")}</Label>
                <Select value={member.role} onValueChange={(v) => setMember({ ...member, role: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{tc(`r_${r}`)}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label className={`block ${end}`}>{tc("phone")}</Label><Input value={member.phone} onChange={(e) => setMember({ ...member, phone: e.target.value })} /></div>
              <Button disabled={!member.name.trim()} onClick={() => staffM.mutate({ camp_id: camp.id, ...member }, { onSuccess: () => setMember({ name: "", role: "phlebotomist", phone: "" }) })}>
                <UserPlus className="h-4 w-4 me-2" />{tc("addMember")}</Button>
            </div>
            <Table><TableBody>
              {data!.staff.map((s: any) => (
                <TableRow key={s.id}><TableCell className={end}>{s.name}</TableCell><TableCell className={end}>{tc(`r_${s.role}`)}</TableCell><TableCell className={end}>{s.phone}</TableCell>
                  <TableCell className="w-10"><Button size="icon" variant="ghost" onClick={() => staffM.mutate({ _delete: s.id })}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>
              ))}
            </TableBody></Table>
            <div className="grid gap-3 md:grid-cols-3">
              {fld("bags_sent", "bagsSent", "number")}
              <div className="md:col-span-2 space-y-1"><Label className={`block ${end}`}>{tc("kits")}</Label>
                <Textarea rows={2} disabled={!editable} value={form.kits_notes ?? ""} onChange={(e) => setForm({ ...form, kits_notes: e.target.value })} /></div>
            </div>
            <Button variant="outline" onClick={() => save.mutate({ id: camp.id, bags_sent: Number(form.bags_sent) || 0, kits_notes: form.kits_notes || null }, { onSuccess: () => toast.success("✓") })}>{tc("save")}</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="donors">
          <Card>
            <CardHeader><div className={`flex items-center justify-between ${row}`}>
              <CardTitle>{tc("tabDonors")}</CardTitle>
              {camp.status === "ongoing" && <Link to={`/app/blood-bank/donations/new?campId=${camp.id}`}><Button><UserPlus className="h-4 w-4 me-2" />{tc("registerDonor")}</Button></Link>}
            </div></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className={end}>{tc("donor")}</TableHead><TableHead className={end}>{tc("group")}</TableHead><TableHead className={end}>{tc("bag")}</TableHead>
                  <TableHead className={end}>{tc("volume")}</TableHead><TableHead className={end}>{tc("time")}</TableHead><TableHead className={end}>{tc("status")}</TableHead><TableHead />
                </TableRow></TableHeader>
                <TableBody>
                  {data!.donations.map((d: any) => (
                    <TableRow key={d.id}>
                      <TableCell className={end}><Link className="underline" to={`/app/blood-bank/donations/${d.id}`}>{d.donor?.first_name} {d.donor?.last_name}</Link></TableCell>
                      <TableCell>{d.donor?.blood_group && <BloodGroupBadge group={d.donor.blood_group} />}</TableCell>
                      <TableCell className={end}>{d.bag_number || "-"}</TableCell>
                      <TableCell className={end}>{d.volume_ml ?? "-"}</TableCell>
                      <TableCell className={end}>{d.donation_time?.slice(0, 5)}</TableCell>
                      <TableCell className={end}><Badge variant={d.received_status === "rejected" ? "destructive" : d.received_status === "accepted" ? "default" : "outline"}>{tc(`r_${d.received_status || "pending"}`)}</Badge></TableCell>
                      <TableCell>{d.received_status === "accepted" && d.donor?.phone && <Button size="icon" variant="ghost" title={tc("thankDonors")} onClick={() => thank(d)}><MessageCircle className="h-4 w-4" /></Button>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transport" className="space-y-4">
          <Card><CardContent className="pt-6 space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              {([["departed_at", "departed", "datetime-local"], ["departure_temp", "depTemp", "number"], ["carrier", "carrier", "text"], ["arrived_at", "arrived", "datetime-local"], ["arrival_temp", "arrTemp", "number"], ["bag_count", "bagCount", "number"]] as const).map(([k, l, t]) => (
                <div key={k} className="space-y-1"><Label className={`block ${end}`}>{tc(l)}</Label>
                  <Input type={t} step="0.1" value={(trip as any)[k]} onChange={(e) => setTrip({ ...trip, [k]: e.target.value })} /></div>
              ))}
            </div>
            <Button onClick={() => tripM.mutate({
              camp_id: camp.id, carrier: trip.carrier || null,
              departed_at: trip.departed_at ? new Date(trip.departed_at).toISOString() : null,
              arrived_at: trip.arrived_at ? new Date(trip.arrived_at).toISOString() : null,
              departure_temp: trip.departure_temp === "" ? null : Number(trip.departure_temp),
              arrival_temp: trip.arrival_temp === "" ? null : Number(trip.arrival_temp),
              bag_count: trip.bag_count === "" ? null : Number(trip.bag_count),
            }, { onSuccess: () => setTrip({ departed_at: "", departure_temp: "", arrived_at: "", arrival_temp: "", carrier: "", bag_count: "" }) })}>
              <Truck className="h-4 w-4 me-2" />{tc("addTrip")}</Button>
            <Table><TableBody>
              {data!.transport.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className={end}>{t.departed_at ? format(new Date(t.departed_at), "dd MMM HH:mm") : "-"} → {t.arrived_at ? format(new Date(t.arrived_at), "HH:mm") : "-"}</TableCell>
                  <TableCell className={end}>{t.departure_temp ?? "-"}° / {t.arrival_temp ?? "-"}°</TableCell>
                  <TableCell className={end}>{t.carrier}</TableCell><TableCell className={end}>{t.bag_count}</TableCell>
                  <TableCell>{t.flagged ? <Badge variant="destructive"><AlertTriangle className="h-3 w-3 me-1" />{tc(`f_${t.flag_reason}`)}</Badge> : <Badge><CheckCircle2 className="h-3 w-3 me-1" />{tc("ok")}</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="receiving">
          <Card><CardContent className="pt-6 space-y-4">
            <p className={`text-sm text-muted-foreground ${end}`}>{tc("receiveDesc")}</p>
            {pending.length === 0 ? (
              <div className={`flex items-center gap-3 ${row}`}><p className="text-muted-foreground">{tc("nothingToReceive")}</p>
                {stats.accepted > 0 && <Link to="/app/blood-bank/testing"><Button variant="outline">{tc("goTesting")}</Button></Link>}</div>
            ) : (
              <>
                <Table><TableBody>
                  {pending.map((d: any) => (
                    <TableRow key={d.id}>
                      <TableCell className={end}>{d.bag_number || d.donation_number}</TableCell>
                      <TableCell className={end}>{d.donor?.first_name} {d.donor?.last_name}</TableCell>
                      <TableCell>{d.donor?.blood_group && <BloodGroupBadge group={d.donor.blood_group} />}</TableCell>
                      <TableCell className="w-64">
                        <Select value={decision[d.id] || ""} onValueChange={(v) => setDecision({ ...decision, [d.id]: v })}>
                          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="accept">{tc("accept")}</SelectItem>
                            {REJECT_REASONS.map((r) => <SelectItem key={r} value={r}>{tc("rejectBag")}: {tc(`rs_${r}`)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody></Table>
                <div className={`flex gap-2 ${row}`}>
                  <Button variant="outline" onClick={() => setDecision(Object.fromEntries(pending.map((d: any) => [d.id, "accept"])))}>{tc("accept")} ✓ ({pending.length})</Button>
                  <Button disabled={receive.isPending || camp.status === "planned"} onClick={confirmReceipt}><CheckCircle2 className="h-4 w-4 me-2" />{tc("confirmReceipt")}</Button>
                </div>
              </>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
            {stat("collected", stats.collected)}{stat("accepted", stats.accepted)}{stat("rejectedBags", stats.rejected)}{stat("failedTests", stats.failed)}{stat("discarded", stats.discarded)}
            {stat("inStock", stats.stock)}{stat("issued", stats.issued)}{stat("deferred", stats.deferred)}{stat("leftover", stats.leftover)}{stat("target", camp.target_bags || 0)}
          </div>
          {deferralReasons.length > 0 && (
            <Card><CardHeader><CardTitle className={end}>{tc("deferralReasons")}</CardTitle></CardHeader>
              <CardContent className={`flex flex-wrap gap-2 ${row}`}>{deferralReasons.map(([r, n]) => <Badge key={r} variant="outline">{r} × {n}</Badge>)}</CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

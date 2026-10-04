import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Search, UserPlus, ShieldCheck, ShieldX } from "lucide-react";
import { toast } from "sonner";
import {
  useBloodDonors, useBloodDonor, useCreateDonation,
  checkDonorEligibility, deferBloodDonor, type EligibilityResult,
} from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";
import { useBBT, QUESTION_KEYS } from "@/lib/blood-bank/i18n";

const donationTypes = ["voluntary", "replacement", "directed", "autologous", "double_rbc"];

export default function DonationFormPage() {
  const navigate = useNavigate();
  const { tt, rtl } = useBBT();
  const [searchParams] = useSearchParams();
  const campId = searchParams.get("campId");
  const backTo = campId ? `/app/blood-bank/camps/${campId}` : "/app/blood-bank/donations";
  const [donorSearch, setDonorSearch] = useState("");
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(searchParams.get("donorId"));
  const { data: donors, isLoading: loadingDonors } = useBloodDonors({ search: donorSearch });
  const { data: selectedDonor } = useBloodDonor(selectedDonorId || "");
  const createDonation = useCreateDonation();

  const [formData, setFormData] = useState({
    donation_date: new Date().toISOString().split("T")[0],
    donation_time: new Date().toTimeString().slice(0, 5),
    donation_type: "voluntary",
    hemoglobin: "", weight: "", blood_pressure: "", pulse_rate: "", temperature: "",
    bag_number: "", volume_ml: "450", notes: "",
  });
  const [answers, setAnswers] = useState<Record<string, boolean>>({ feeling_well: true });
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [checking, setChecking] = useState(false);
  const set = (k: string, v: string) => { setFormData((f) => ({ ...f, [k]: v })); setEligibility(null); };

  const runCheck = async () => {
    if (!selectedDonorId) return null;
    setChecking(true);
    try {
      const r = await checkDonorEligibility({
        donorId: selectedDonorId,
        hemoglobin: formData.hemoglobin ? parseFloat(formData.hemoglobin) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        donationType: formData.donation_type, answers,
      });
      setEligibility(r);
      return r;
    } catch (e: any) { toast.error(e.message); return null; } finally { setChecking(false); }
  };

  const handleDefer = async () => {
    if (!selectedDonorId || !eligibility) return;
    const days = eligibility.defer_days || 30;
    try {
      await deferBloodDonor(selectedDonorId, eligibility.reasons.map((r) => tt(`r_${r}`)).join("; "), days);
      toast.success(tt("deferredFor", { n: days }));
      navigate(campId ? backTo : "/app/blood-bank/donors");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonorId) return;
    const r = eligibility ?? (await runCheck());
    if (!r?.eligible) return;
    try {
      await createDonation.mutateAsync({
        donor_id: selectedDonorId,
        donation_date: formData.donation_date,
        donation_time: formData.donation_time,
        donation_type: formData.donation_type,
        hemoglobin_level: formData.hemoglobin ? parseFloat(formData.hemoglobin) : null,
        blood_pressure: formData.blood_pressure || null,
        pulse_rate: formData.pulse_rate ? parseInt(formData.pulse_rate) : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        bag_number: formData.bag_number || null,
        volume_ml: formData.volume_ml ? parseInt(formData.volume_ml) : null,
        screening_passed: true,
        questionnaire: answers,
        notes: formData.notes || null,
        status: campId ? "collecting" : "screening",
        camp_id: campId || null,
      } as any);
      navigate(backTo);
    } catch { /* toast in hook */ }
  };

  const row = rtl ? "flex-row-reverse" : "";
  const field = (k: keyof typeof formData, label: string, type = "text", extra: any = {}) => (
    <div className="space-y-2">
      <Label htmlFor={k} className={rtl ? "block text-end" : ""}>{label}</Label>
      <Input id={k} type={type} value={formData[k]} onChange={(e) => set(k, e.target.value)} {...extra} />
    </div>
  );

  return (
    <div className="space-y-6" dir={rtl ? "rtl" : "ltr"}>
      <PageHeader title={tt("startDonation")} description={tt("startDonationDesc")}
        actions={<Button variant="outline" onClick={() => navigate(backTo)}><ArrowLeft className="h-4 w-4 me-2" />{tt("backToDonations")}</Button>} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className={`flex items-center justify-between ${row}`}>
              <CardTitle>{tt("donorSelection")}</CardTitle>
              <Link to="/app/blood-bank/donors/new"><Button type="button" variant="outline" size="sm"><UserPlus className="h-4 w-4 me-2" />{tt("registerDonor")}</Button></Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDonor ? (
              <div className={`flex items-center justify-between p-4 bg-muted rounded-lg ${row}`}>
                <div className={rtl ? "text-end" : ""}>
                  <p className="font-medium">{selectedDonor.first_name} {selectedDonor.last_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedDonor.donor_number} • {selectedDonor.phone}</p>
                  {selectedDonor.last_donation_date && <p className="text-xs text-muted-foreground mt-1">{tt("lastDonation")}: {selectedDonor.last_donation_date}</p>}
                </div>
                <div className={`flex items-center gap-2 ${row}`}>
                  <BloodGroupBadge group={selectedDonor.blood_group} size="lg" />
                  <Button type="button" variant="outline" size="sm" onClick={() => { setSelectedDonorId(null); setEligibility(null); }}>{tt("change")}</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={tt("searchDonors")} value={donorSearch} onChange={(e) => setDonorSearch(e.target.value)} className="ps-9" />
                </div>
                {donorSearch && donors && donors.length > 0 && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {donors.filter((d) => d.status === "active" || d.status === "deferred").slice(0, 6).map((donor) => (
                      <div key={donor.id} className={`p-3 hover:bg-muted cursor-pointer border-b last:border-b-0 flex items-center justify-between ${row}`}
                        onClick={() => { setSelectedDonorId(donor.id); setDonorSearch(""); setEligibility(null); }}>
                        <div className={rtl ? "text-end" : ""}>
                          <p className="font-medium">{donor.first_name} {donor.last_name}</p>
                          <p className="text-sm text-muted-foreground">{donor.donor_number} • {donor.total_donations} {tt("donations")}</p>
                        </div>
                        <BloodGroupBadge group={donor.blood_group} />
                      </div>
                    ))}
                  </div>
                )}
                {donorSearch && donors?.length === 0 && !loadingDonors && <p className="text-sm text-muted-foreground">{tt("noActiveDonors")}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className={rtl ? "text-end" : ""}>{tt("donationDetails")}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {field("donation_date", tt("donationDate") + " *", "date", { required: true })}
            {field("donation_time", tt("donationTime"), "time")}
            <div className="space-y-2">
              <Label className={rtl ? "block text-end" : ""}>{tt("donationType")} *</Label>
              <Select value={formData.donation_type} onValueChange={(v) => set("donation_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{donationTypes.map((v) => <SelectItem key={v} value={v}>{tt(`t_${v}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {field("hemoglobin", tt("hb") + " *", "number", { step: "0.1", min: "5", max: "22", required: true })}
            {field("weight", tt("weight") + " *", "number", { step: "0.1", min: "20", max: "250", required: true })}
            {field("blood_pressure", tt("bp"), "text", { placeholder: "120/80" })}
            {field("pulse_rate", tt("pulse"), "number")}
            {field("temperature", tt("temp"), "number", { step: "0.1" })}
            {field("bag_number", tt("bagNumber"))}
            {field("volume_ml", tt("volume"), "number", { min: "200", max: "500" })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className={rtl ? "text-end" : ""}>{tt("questionnaire")}</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {QUESTION_KEYS.map((q) => (
              <label key={q} className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer ${row}`}>
                <Checkbox checked={!!answers[q]} onCheckedChange={(c) => { setAnswers((a) => ({ ...a, [q]: c === true })); setEligibility(null); }} />
                <span className={`text-sm ${rtl ? "text-end" : ""}`}>{tt(`q_${q}`)}</span>
              </label>
            ))}
            <div className="md:col-span-2 space-y-2">
              <Label className={rtl ? "block text-end" : ""}>{tt("notes")}</Label>
              <Textarea rows={2} value={formData.notes} onChange={(e) => set("notes", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {eligibility && (
          eligibility.eligible ? (
            <Alert><ShieldCheck className="h-4 w-4" /><AlertTitle>{tt("eligible")}</AlertTitle></Alert>
          ) : (
            <Alert variant="destructive">
              <ShieldX className="h-4 w-4" />
              <AlertTitle>{tt("notEligible")}</AlertTitle>
              <AlertDescription>
                <ul className="list-disc ps-5 mt-1">{eligibility.reasons.map((r) => <li key={r}>{tt(`r_${r}`)}</li>)}</ul>
                {eligibility.defer_days > 0 && (
                  <Button type="button" size="sm" variant="outline" className="mt-3" onClick={handleDefer}>
                    {tt("deferDonor")} ({eligibility.defer_days})
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )
        )}

        <div className={`flex justify-end gap-3 ${row}`}>
          <Button type="button" variant="outline" onClick={() => navigate(backTo)}>{tt("cancel")}</Button>
          <Button type="button" variant="secondary" disabled={!selectedDonorId || checking} onClick={runCheck}>
            {checking ? <Loader2 className="h-4 w-4 me-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 me-2" />}{tt("checkEligibility")}
          </Button>
          <Button type="submit" disabled={createDonation.isPending || !selectedDonorId || (eligibility ? !eligibility.eligible : false)}>
            {createDonation.isPending ? <><Loader2 className="h-4 w-4 me-2 animate-spin" />{tt("saving")}</> : <><Save className="h-4 w-4 me-2" />{tt("startBtn")}</>}
          </Button>
        </div>
      </form>
    </div>
  );
}

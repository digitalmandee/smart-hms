import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateDialysisPatient } from "@/hooks/useDialysis";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Search, UserPlus } from "lucide-react";

export default function DialysisEnrollPatientPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const createPatient = useCreateDialysisPatient();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const [form, setForm] = useState({
    dry_weight_kg: "",
    vascular_access_type: "",
    hepatitis_b_status: "",
    hepatitis_c_status: "",
    schedule_pattern: "",
    shift_preference: "",
  });

  const handleSearch = async () => {
    if (!searchQuery.trim() || !profile?.organization_id) return;
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, first_name, last_name, patient_number, phone, date_of_birth, gender")
        .eq("organization_id", profile.organization_id)
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,patient_number.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .limit(20);
      if (error) throw error;
      setSearchResults(data || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedPatient) {
      toast.error("Please select a patient first");
      return;
    }
    createPatient.mutate(
      {
        patient_id: selectedPatient.id,
        dry_weight_kg: form.dry_weight_kg ? Number(form.dry_weight_kg) : undefined,
        vascular_access_type: form.vascular_access_type || undefined,
        hepatitis_b_status: form.hepatitis_b_status || undefined,
        hepatitis_c_status: form.hepatitis_c_status || undefined,
        schedule_pattern: form.schedule_pattern || undefined,
        shift_preference: form.shift_preference || undefined,
      },
      { onSuccess: () => navigate("/app/dialysis/patients") }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enroll Dialysis Patient"
        description="Register an existing patient for the dialysis program"
        breadcrumbs={[
          { label: "Dialysis", href: "/app/dialysis" },
          { label: "Patients", href: "/app/dialysis/patients" },
          { label: "Enroll" },
        ]}
      />

      {/* Patient Search */}
      <Card className="max-w-3xl">
        <CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" />Find Patient</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name, MRN, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? "Searching..." : "Search"}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${selectedPatient?.id === p.id ? "bg-primary/10 border-l-4 border-primary" : ""}`}
                  onClick={() => setSelectedPatient(p)}
                >
                  <p className="font-medium">{p.first_name} {p.last_name}</p>
                  <p className="text-sm text-muted-foreground">MRN: {p.patient_number} • {p.gender} • {p.phone || "No phone"}</p>
                </button>
              ))}
            </div>
          )}

          {selectedPatient && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium text-primary">Selected: {selectedPatient.first_name} {selectedPatient.last_name} ({selectedPatient.patient_number})</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialysis Details */}
      {selectedPatient && (
        <Card className="max-w-3xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />Dialysis Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Dry Weight (kg)</Label>
                <Input type="number" step="0.1" value={form.dry_weight_kg} onChange={(e) => setForm((f) => ({ ...f, dry_weight_kg: e.target.value }))} placeholder="e.g. 65.0" />
              </div>
              <div>
                <Label>Vascular Access Type</Label>
                <Select value={form.vascular_access_type} onValueChange={(v) => setForm((f) => ({ ...f, vascular_access_type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select access type..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="av_fistula">AV Fistula</SelectItem>
                    <SelectItem value="av_graft">AV Graft</SelectItem>
                    <SelectItem value="temporary_catheter">Temporary Catheter</SelectItem>
                    <SelectItem value="permanent_catheter">Permanent Catheter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hepatitis B Status</Label>
                <Select value={form.hepatitis_b_status} onValueChange={(v) => setForm((f) => ({ ...f, hepatitis_b_status: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="vaccinated">Vaccinated</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Hepatitis C Status</Label>
                <Select value={form.hepatitis_c_status} onValueChange={(v) => setForm((f) => ({ ...f, hepatitis_c_status: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Schedule Pattern</Label>
                <Select value={form.schedule_pattern} onValueChange={(v) => setForm((f) => ({ ...f, schedule_pattern: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select pattern..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mwf">MWF (Mon/Wed/Fri)</SelectItem>
                    <SelectItem value="tts">TTS (Tue/Thu/Sat)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Shift Preference</Label>
                <Select value={form.shift_preference} onValueChange={(v) => setForm((f) => ({ ...f, shift_preference: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select shift..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={createPatient.isPending} className="w-full">
              {createPatient.isPending ? "Enrolling..." : "Enroll in Dialysis Program"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

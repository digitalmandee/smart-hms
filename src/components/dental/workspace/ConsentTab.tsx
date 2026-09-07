import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSignature, Printer } from "lucide-react";
import { useDentalT } from "@/lib/dental/i18n";
import { useDentalConsents, useSaveDentalConsent } from "@/hooks/useDentalWorkspace";

const TYPES = ["extraction", "root_canal", "implant", "orthodontic", "anaesthesia", "prosthetic", "photography", "general"];

export default function ConsentTab({ patientId }: { patientId: string }) {
  const { dt } = useDentalT();
  const { data: consents } = useDentalConsents(patientId);
  const save = useSaveDentalConsent();

  const [consentType, setConsentType] = useState("extraction");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [teeth, setTeeth] = useState("");
  const [signedBy, setSignedBy] = useState("");

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="h-fit">
        <CardHeader className="pb-3"><CardTitle className="text-base">{dt("dw.newRecord")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">{dt("dw.f.consentType")}</Label>
            <Select value={consentType} onValueChange={setConsentType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{dt("dw.f.title")}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{dt("dw.f.teeth")}</Label>
            <Input value={teeth} onChange={(e) => setTeeth(e.target.value)} placeholder="36, 37" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{dt("dw.f.body")}</Label>
            <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{dt("dw.f.signedBy")}</Label>
            <Input value={signedBy} onChange={(e) => setSignedBy(e.target.value)} />
          </div>
          <Button
            className="w-full gap-1.5"
            disabled={!title.trim()}
            onClick={() =>
              save.mutate(
                {
                  patient_id: patientId,
                  consent_type: consentType,
                  title,
                  body,
                  tooth_numbers: teeth || null,
                  signed_by_name: signedBy || null,
                  signed_at: signedBy ? new Date().toISOString() : null,
                },
                { onSuccess: () => { setTitle(""); setBody(""); setTeeth(""); setSignedBy(""); } }
              )
            }
          >
            <FileSignature className="h-4 w-4" /> {dt("dw.save")}
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3"><CardTitle className="text-base">{dt("dw.tab.consent")}</CardTitle></CardHeader>
        <CardContent>
          {!consents?.length ? (
            <p className="text-sm text-muted-foreground">{dt("dw.noRecords")}</p>
          ) : (
            <div className="space-y-2">
              {consents.map((c: any) => (
                <div key={c.id} className="p-3 border rounded-lg space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{c.title}</span>
                    <Badge variant="outline">{String(c.consent_type).replace(/_/g, " ")}</Badge>
                    {c.tooth_numbers && <Badge variant="secondary">#{c.tooth_numbers}</Badge>}
                    {c.signed_at ? (
                      <Badge>{dt("dw.f.signedAt")}: {new Date(c.signed_at).toLocaleDateString()}</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="ms-auto h-7"
                        onClick={() => save.mutate({ id: c.id, patient_id: patientId, consent_type: c.consent_type, title: c.title, signed_at: new Date().toISOString() })}
                      >
                        {dt("dw.f.sign")}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.print()}>
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                  {c.body && <p className="text-xs text-muted-foreground whitespace-pre-wrap">{c.body}</p>}
                  {c.signed_by_name && <p className="text-xs">{dt("dw.f.signedBy")}: {c.signed_by_name}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

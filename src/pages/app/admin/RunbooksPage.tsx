import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  AlarmClock,
  DatabaseBackup,
  HeartHandshake,
  Hospital,
  Scale,
  ListChecks,
} from "lucide-react";

const RUNBOOKS = [
  {
    id: "incident",
    icon: AlarmClock,
    title: "Incident Response",
    summary: "Severity levels, escalation, comms template, postmortem.",
    sections: [
      {
        h: "Severity ladder",
        body: `**SEV-1** Patient safety risk OR full outage → page on-call + clinical lead immediately. Target ack ≤ 5 min, mitigation ≤ 30 min.
**SEV-2** Single module down OR billing blocked for one site → page on-call. Target ack ≤ 15 min, mitigation ≤ 2 h.
**SEV-3** Degraded performance, single-user issue → next business day.`,
      },
      {
        h: "Escalation chain",
        body: `1. On-call engineer (PagerDuty / phone)
2. Engineering lead
3. CTO
4. CEO + clinical lead (SEV-1 only)`,
      },
      {
        h: "Communication template",
        body: `Subject: [SEV-X] HealthOS 24 — <one-line impact>
Detected: <UTC time>
Impact: <users / sites / modules affected>
Cause (working theory): <one line>
Action: <what we're doing now>
Next update: <UTC time, max 30 min for SEV-1>`,
      },
      {
        h: "Postmortem (within 5 business days)",
        body: `Timeline · Impact · Root cause · What went well · What went wrong · Action items with owners + due dates. Blameless. Filed in /docs/postmortems/.`,
      },
    ],
  },
  {
    id: "backup",
    icon: DatabaseBackup,
    title: "Backup & Restore",
    summary: "Daily backups, PITR, weekly restore drill, single-org export.",
    sections: [
      {
        h: "Daily automated backups",
        body: `Supabase takes daily snapshots automatically. PITR (Point-in-Time Recovery) lets us restore to any second in the last 7 days — must be enabled in Settings → Add-ons (see Security Setup page).`,
      },
      {
        h: "Restore drill (run weekly)",
        body: `1. Spin up a scratch Supabase project.
2. Restore the latest backup into it.
3. Run smoke checks: count of patients, invoices, lab_orders matches production within 0.1%.
4. Connect the staging app to the restored DB and verify login + open one patient chart.
5. Document drill date + result in /docs/drills/restore-YYYY-MM-DD.md.`,
      },
      {
        h: "Single-organization export",
        body: `For data subject requests / vendor handover:
\`\`\`sql
COPY (SELECT * FROM patients WHERE organization_id = $1) TO '/tmp/patients.csv' CSV HEADER;
-- repeat per table
\`\`\`
Encrypt the bundle with GPG before sharing.`,
      },
    ],
  },
  {
    id: "ksa",
    icon: HeartHandshake,
    title: "KSA Integration Onboarding",
    summary: "NPHIES, Wasfaty, Tatmeen, Nafath, Sehhaty, ZATCA Phase-2.",
    sections: [
      {
        h: "ZATCA Phase-2 (e-invoicing)",
        body: `1. Register seller with ZATCA Fatoora portal.
2. Generate CSR via Settings → KSA → ZATCA → Compliance.
3. Submit CSR, receive PCSID; store in vault as \`ZATCA_PCSID\` secret.
4. Run compliance checks (3 invoices: standard, simplified, credit note).
5. Switch environment to Production.
6. Verify chained hash on first 5 live invoices.`,
      },
      {
        h: "NPHIES (insurance claims)",
        body: `1. Apply for NPHIES license via CCHI portal.
2. Receive endpoint URL + client cert; stored as \`NPHIES_ENDPOINT\` + \`NPHIES_CERT\` secrets.
3. Configure payer codes in Insurance → Payers.
4. Run scrubber on first 10 claims before submission.`,
      },
      {
        h: "Wasfaty (e-prescriptions)",
        body: `1. Onboarding via MOH e-services portal.
2. Pharmacist NPHIES license required.
3. Configure in Settings → KSA → Wasfaty (license + facility code).
4. Test with sample prescription before going live.`,
      },
      {
        h: "Tatmeen, Nafath, Sehhaty",
        body: `Each requires separate facility-level enrollment with SFDA / NIC / MOH. See Settings → KSA for per-integration setup wizards.`,
      },
    ],
  },
  {
    id: "facility",
    icon: Hospital,
    title: "New Facility Onboarding",
    summary: "Master data, users, services, formulary, branding.",
    sections: [
      {
        h: "Phase A — Setup (Day 1-3)",
        body: `1. Create organization in Super Admin.
2. Create branches (one per physical site).
3. Seed Chart of Accounts (CoA) — auto via \`create_coa_hierarchy\` RPC.
4. Configure fiscal year, currency, country (drives VAT/ZATCA).
5. Upload logo, set receipt template, working hours.`,
      },
      {
        h: "Phase B — Master data (Day 3-7)",
        body: `Services & price list · Doctors + specializations · Departments · Wards + bed types · Insurance payers + plans · Pharmacy formulary import · Tax slabs · Suppliers.`,
      },
      {
        h: "Phase C — Users & training (Day 7-14)",
        body: `Create users with roles. Mandatory MFA enrollment for admins/finance. 2-hour training per role: reception, doctor, nurse, pharmacist, lab tech, accountant. Practice on demo data.`,
      },
      {
        h: "Phase D — Pilot (Day 14-30)",
        body: `Run parallel with legacy system for 2 weeks. Daily reconciliation. Daily standup. Cut over only after 7 consecutive clean closing days.`,
      },
    ],
  },
  {
    id: "legal",
    icon: Scale,
    title: "Legal Pack Checklist",
    summary: "Terms, Privacy, DPA, BAA, data residency, consents.",
    sections: [
      {
        h: "Required documents per jurisdiction",
        body: `**Saudi Arabia (PDPL)**: Privacy Notice (AR + EN), Patient Consent Form (AR), DPA with each customer, NPHIES authorisation letter, ZATCA seller registration.
**Pakistan**: Privacy Notice (UR + EN), Patient Consent Form (UR), agreement under PECA 2016.
**Both**: Terms of Service, Subprocessor list (Supabase + AWS region), Incident Notification SLA (≤ 72h breach reporting), Data Retention Policy (10y adult / 25y minor records).`,
      },
      {
        h: "Data residency confirmation",
        body: `Confirm Supabase region matches customer's regulatory home: KSA customers → eu-west or me-central; PK customers → ap-south. Document the chosen region in the customer's DPA appendix.`,
      },
    ],
  },
  {
    id: "exit",
    icon: ListChecks,
    title: "Pilot Exit Criteria",
    summary: "Hard gates that must be green to leave pilot.",
    sections: [
      {
        h: "Required green flags",
        body: `□ Zero \`error\`-level security findings open
□ All admins MFA-enrolled
□ Leaked-password protection ON
□ PITR enabled, restore drill passed in last 14 days
□ 7 consecutive clean daily closings
□ < 5 SEV-2/3 incidents in last 30 days, zero SEV-1
□ Clinical UAT signed off per module by named clinician
□ KSA integrations live (where applicable): ZATCA, NPHIES, Wasfaty
□ Legal pack signed (Terms, Privacy, DPA, BAA where required)
□ On-call rotation defined and acknowledged
□ Support SLAs documented in customer contract`,
      },
    ],
  },
] as const;

export default function RunbooksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Runbooks"
        description="Living docs for incident response, backups, KSA onboarding, facility onboarding, legal, and pilot exit criteria."
      />

      <div className="grid gap-4">
        {RUNBOOKS.map((r) => {
          const Icon = r.icon;
          return (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-4 w-4 text-primary" />
                  {r.title}
                </CardTitle>
                <CardDescription>{r.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {r.sections.map((s, i) => (
                    <AccordionItem key={i} value={`${r.id}-${i}`}>
                      <AccordionTrigger className="text-sm">{s.h}</AccordionTrigger>
                      <AccordionContent>
                        <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">
                          {s.body}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

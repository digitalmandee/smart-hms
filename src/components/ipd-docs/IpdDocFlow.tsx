import { DocPageWrapper, SectionTitle, ProcessFlow } from "@/components/shared-docs/DocPageWrapper";

export const IpdDocFlow = () => (
  <DocPageWrapper pageNumber={3} totalPages={9} moduleTitle="IPD Module Guide">
    <SectionTitle icon="🔄" title="Patient Journey — Inpatient Process Flow" subtitle="Complete admission-to-discharge workflow" />
    <ProcessFlow steps={[
      { icon: "📨", title: "Admission Request", desc: "OPD doctor or ER physician initiates admission. Selects admission type: elective, emergency, or maternity. Insurance pre-auth if required." },
      { icon: "📋", title: "Admission Form & Consent", desc: "Receptionist completes admission form with patient details, NOK info, payment mode. Patient signs consent forms digitally." },
      { icon: "🛏️", title: "Bed Selection & Assignment", desc: "System shows real-time bed availability by ward/floor. Bed is assigned based on type (General, Semi-Private, ICU, NICU)." },
      { icon: "👨‍⚕️", title: "Daily Doctor Rounds", desc: "Attending doctor performs daily rounds. Records progress notes, updates treatment plan, adjusts medications. Alerts for critical changes." },
      { icon: "👩‍⚕️", title: "Nursing Care & Medication", desc: "Nurses follow medication administration chart. Record vitals every 4-8 hours. Manage IV lines, wound care, and patient monitoring." },
      { icon: "💰", title: "Room Charges & Consumables", desc: "System auto-calculates daily bed charges. Nurses add consumables used. Running bill is visible to patient and billing team." },
      { icon: "📄", title: "Discharge Summary", desc: "Doctor prepares discharge summary with diagnosis, treatment given, medications, follow-up plan. Auto-populated from EMR data." },
      { icon: "💳", title: "Final Settlement & Billing", desc: "All charges consolidated into final invoice. Insurance claim submitted. Patient settles balance and receives discharge clearance." },
    ]} />
  </DocPageWrapper>
);

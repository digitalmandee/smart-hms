import { DocPageWrapper, SectionTitle, ProcessFlow } from "@/components/shared-docs/DocPageWrapper";

export const DialDocFlow = () => (
  <DocPageWrapper pageNumber={3} totalPages={7} moduleTitle="Dialysis Center">
    <SectionTitle icon="🔄" title="Dialysis Session Process Flow" subtitle="Patient enrollment to post-session workflow" />
    <ProcessFlow steps={[
      { icon: "📋", title: "Patient Enrollment", desc: "Nephrologist registers patient for dialysis program. Captures dry weight, vascular access type, dialysis prescription parameters." },
      { icon: "📅", title: "Schedule Assignment", desc: "Patient assigned to recurring schedule (MWF or TTS). Machine and station allocated. Nurse shift aligned with patient load." },
      { icon: "❤️", title: "Pre-Session Vitals", desc: "Nurse records weight, BP, temperature, pulse before session. Compares with dry weight to calculate UF goal. Medications administered." },
      { icon: "⚙️", title: "Machine Setup", desc: "Dialysis machine primed and configured: blood flow rate, dialysate composition, UF rate, session duration. Safety checks completed." },
      { icon: "📊", title: "Intra-Dialysis Monitoring", desc: "Vitals recorded every 30 min. UF progress tracked in real-time. Complications (hypotension, cramps) logged with interventions." },
      { icon: "🏁", title: "Post-Session Assessment", desc: "Post-dialysis weight and vitals recorded. Actual vs target UF reviewed. Access site inspected. Patient condition documented." },
      { icon: "💳", title: "Billing & Documentation", desc: "Session charges auto-calculated (machine time, consumables, medications). Insurance claim prepared. Session report filed in EMR." },
    ]} />
  </DocPageWrapper>
);

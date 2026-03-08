import { DocPageWrapper, SectionTitle, ProcessFlow } from "@/components/shared-docs/DocPageWrapper";

export const OtDocFlow = () => (
  <DocPageWrapper pageNumber={3} totalPages={8} moduleTitle="Surgery / OT Module Guide">
    <SectionTitle icon="🔄" title="Surgery Process Flow" subtitle="End-to-end operation theatre workflow" />
    <ProcessFlow steps={[
      { icon: "📋", title: "Surgery Request", desc: "Surgeon submits surgery request with procedure type, urgency level, estimated duration, and required equipment/team." },
      { icon: "📅", title: "OT Scheduling", desc: "OT coordinator assigns theatre room, date/time slot. Checks surgeon availability, anesthetist schedule, and equipment readiness." },
      { icon: "🏥", title: "Pre-Op Assessment", desc: "Anesthetist evaluates patient fitness (ASA grade). Nurse completes pre-op checklist: consent, NPO status, allergies, blood grouping." },
      { icon: "💉", title: "Anesthesia Planning", desc: "Anesthetist selects anesthesia type (GA/Spinal/Local). Plans airway management, drug protocol, and monitoring parameters." },
      { icon: "🔬", title: "Live Surgery", desc: "Real-time tracking of surgery stages. Instrument count verified. Vitals monitored continuously. Blood loss and fluid I/O recorded." },
      { icon: "🫀", title: "PACU Recovery", desc: "Patient transferred to Post-Anesthesia Care Unit. Aldrete scoring for recovery assessment. Vitals monitored every 15 minutes." },
      { icon: "📝", title: "Post-Op Orders", desc: "Surgeon writes post-op orders: medications, diet, wound care, activity restrictions. Orders auto-routed to nursing station." },
      { icon: "🛏️", title: "Ward Transfer", desc: "Patient cleared from PACU and transferred to assigned ward/ICU. Complete surgical record filed in patient EMR." },
    ]} />
  </DocPageWrapper>
);

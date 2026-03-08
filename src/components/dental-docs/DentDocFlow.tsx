import { DocPageWrapper, SectionTitle, ProcessFlow } from "@/components/shared-docs/DocPageWrapper";

export const DentDocFlow = () => (
  <DocPageWrapper pageNumber={3} totalPages={8} moduleTitle="Dental Module">
    <SectionTitle icon="🔄" title="Dental Patient Journey" subtitle="Registration to treatment completion" />
    <ProcessFlow steps={[
      { icon: "📋", title: "Patient Registration", desc: "New patient registered with dental history, allergies, medical conditions. Existing patients retrieved by MRN or phone number." },
      { icon: "🦷", title: "3D Tooth Charting", desc: "Dentist maps conditions on interactive FDI tooth chart. Each tooth marked with status: healthy, caries, missing, restored, etc." },
      { icon: "📝", title: "Condition Recording", desc: "Detailed findings recorded per tooth/surface. Periodontal charting, pocket depths, mobility grades. Photos attached to chart." },
      { icon: "📊", title: "Treatment Plan", desc: "Treatment plan created with prioritized procedures, cost estimates, and timeline. Patient reviews and approves plan digitally." },
      { icon: "🔬", title: "Procedure Execution", desc: "Dentist performs procedure (filling, RCT, extraction, crown). CDT codes assigned. Materials and time logged automatically." },
      { icon: "📡", title: "Dental Imaging", desc: "Periapical, panoramic, or CBCT images captured. Stored in PACS with tooth-level tagging. Before/after comparison available." },
      { icon: "💳", title: "Billing & Follow-Up", desc: "Invoice generated from treatment plan. Insurance claim with CDT codes. Follow-up appointment scheduled for review." },
    ]} />
  </DocPageWrapper>
);

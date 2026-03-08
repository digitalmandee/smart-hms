import { DocPageWrapper, SectionTitle, ProcessFlow } from "@/components/shared-docs/DocPageWrapper";

export const OpdDocFlow = () => (
  <DocPageWrapper pageNumber={3} totalPages={9} moduleTitle="OPD Module Guide">
    <SectionTitle icon="🔄" title="Patient Journey — OPD Process Flow" subtitle="End-to-end outpatient workflow from arrival to follow-up" />
    <ProcessFlow steps={[
      { icon: "🚶", title: "Patient Arrival", desc: "Patient walks in or arrives for a scheduled appointment. Reception verifies identity using MRN, National ID, or phone number." },
      { icon: "📋", title: "Reception Check-In", desc: "Receptionist registers new patient or retrieves existing record. Assigns doctor, selects department, and creates appointment entry." },
      { icon: "🎟️", title: "Token Generation", desc: "System auto-generates a queue token. Patient receives SMS/display notification with estimated wait time and token number." },
      { icon: "❤️", title: "Vitals Recording", desc: "Nurse records BP, temperature, pulse, SpO2, weight, height. BMI is auto-calculated. Vitals appear on doctor's screen instantly." },
      { icon: "👨‍⚕️", title: "Doctor Consultation", desc: "Doctor reviews vitals, records SOAP notes (Subjective, Objective, Assessment, Plan). Uses ICD-10 coding for diagnosis." },
      { icon: "📝", title: "Orders & Referrals", desc: "Doctor places lab orders, imaging requests, or specialist referrals. Orders are routed automatically to respective departments." },
      { icon: "💊", title: "Prescription & Dispensing", desc: "E-prescription is generated with drug interactions check. Sent to pharmacy queue. Wasfaty integration for KSA compliance." },
      { icon: "💳", title: "Checkout & Billing", desc: "Invoice is auto-generated from consultation fees, lab charges, and pharmacy items. Supports cash, card, insurance, and split payments." },
      { icon: "📅", title: "Follow-Up Scheduling", desc: "Doctor or receptionist schedules follow-up visit. Patient receives SMS reminder. Record is closed and ready for next visit." },
    ]} />
  </DocPageWrapper>
);

import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 1, title: "Appointment Booking & Check-In", page: 3 },
  { num: 2, title: "Token Queue & Priority", page: 4 },
  { num: 3, title: "Consultation — Vitals & SOAP Notes", page: 5 },
  { num: 4, title: "Orders — Lab, Imaging & Referrals", page: 6 },
  { num: 5, title: "Prescriptions & Dispensing", page: 7 },
  { num: 6, title: "Checkout & Billing", page: 8 },
];
export const OpdDocToc = () => <DocToc items={items} moduleTitle="OPD Module Guide" totalPages={8} />;

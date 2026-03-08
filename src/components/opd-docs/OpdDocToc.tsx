import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 0, title: "Process Flow & Patient Journey", page: 3 },
  { num: 1, title: "Appointment Booking & Check-In", page: 4 },
  { num: 2, title: "Token Queue & Priority", page: 5 },
  { num: 3, title: "Consultation — Vitals & SOAP Notes", page: 6 },
  { num: 4, title: "Orders — Lab, Imaging & Referrals", page: 7 },
  { num: 5, title: "Prescriptions & Dispensing", page: 8 },
  { num: 6, title: "Checkout & Billing", page: 9 },
];
export const OpdDocToc = () => <DocToc items={items} moduleTitle="OPD Module Guide" totalPages={9} />;

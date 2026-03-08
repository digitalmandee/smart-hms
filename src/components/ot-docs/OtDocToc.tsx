import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 0, title: "Process Flow — Surgery Workflow", page: 3 },
  { num: 1, title: "Surgery Request & Scheduling", page: 4 },
  { num: 2, title: "Pre-Op Assessment & Consent", page: 5 },
  { num: 3, title: "Anesthesia Planning & Record", page: 6 },
  { num: 4, title: "Live Surgery — Monitoring & Instruments", page: 7 },
  { num: 5, title: "PACU & Post-Op Recovery", page: 8 },
];
export const OtDocToc = () => <DocToc items={items} moduleTitle="Surgery / OT Module Guide" totalPages={8} />;

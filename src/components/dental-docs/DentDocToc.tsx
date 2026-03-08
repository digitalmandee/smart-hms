import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 0, title: "Process Flow — Dental Patient Journey", page: 3 },
  { num: 1, title: "3D Tooth Chart & Conditions", page: 4 },
  { num: 2, title: "Treatment Plans", page: 5 },
  { num: 3, title: "Procedures & Pricing", page: 6 },
  { num: 4, title: "Oral Surgery", page: 7 },
  { num: 5, title: "Dental Imaging", page: 8 },
];
export const DentDocToc = () => <DocToc items={items} moduleTitle="Dental Module" totalPages={8} />;

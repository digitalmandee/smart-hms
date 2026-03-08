import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 1, title: "3D Tooth Chart & Conditions", page: 3 },
  { num: 2, title: "Treatment Plans", page: 4 },
  { num: 3, title: "Procedures & Pricing", page: 5 },
  { num: 4, title: "Dental Imaging", page: 6 },
];
export const DentDocToc = () => <DocToc items={items} pageNumber={2} totalPages={6} module="Dental Module" />;

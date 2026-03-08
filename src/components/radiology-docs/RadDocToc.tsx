import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 0, title: "Process Flow — Imaging Workflow", page: 3 },
  { num: 1, title: "Order Management & Scheduling", page: 4 },
  { num: 2, title: "Report Writing & Templates", page: 5 },
  { num: 3, title: "PACS Integration & Image Viewing", page: 6 },
];
export const RadDocToc = () => <DocToc items={items} moduleTitle="Radiology Module Guide" totalPages={6} />;

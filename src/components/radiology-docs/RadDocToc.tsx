import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 1, title: "Order Management & Scheduling", page: 3 },
  { num: 2, title: "Report Writing & Templates", page: 4 },
  { num: 3, title: "PACS Integration & Image Viewing", page: 5 },
];
export const RadDocToc = () => <DocToc items={items} moduleTitle="Radiology Module Guide" totalPages={5} />;

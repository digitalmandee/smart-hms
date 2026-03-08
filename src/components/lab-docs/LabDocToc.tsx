import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 1, title: "Order Reception & Sample Collection", page: 3 },
  { num: 2, title: "Result Entry & Validation", page: 4 },
  { num: 3, title: "Test Catalog & Templates", page: 5 },
];
export const LabDocToc = () => <DocToc items={items} moduleTitle="Laboratory Module Guide" totalPages={5} />;

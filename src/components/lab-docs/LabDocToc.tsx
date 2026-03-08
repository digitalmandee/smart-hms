import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 0, title: "Process Flow — Lab Workflow", page: 3 },
  { num: 1, title: "Order Reception & Sample Collection", page: 4 },
  { num: 2, title: "Result Entry & Validation", page: 5 },
  { num: 3, title: "Test Catalog & Templates", page: 6 },
];
export const LabDocToc = () => <DocToc items={items} moduleTitle="Laboratory Module Guide" totalPages={6} />;

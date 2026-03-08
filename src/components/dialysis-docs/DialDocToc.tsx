import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 1, title: "Patient Enrollment", page: 3 },
  { num: 2, title: "Session Workflow", page: 4 },
  { num: 3, title: "Machine Management", page: 5 },
  { num: 4, title: "Scheduling & Reports", page: 6 },
];
export const DialDocToc = () => <DocToc items={items} pageNumber={2} totalPages={6} module="Dialysis Center" />;

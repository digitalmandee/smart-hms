import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 1, title: "Employee Management", page: 3 },
  { num: 2, title: "Attendance & Leave", page: 4 },
  { num: 3, title: "Payroll Processing", page: 5 },
  { num: 4, title: "Recruitment & Onboarding", page: 6 },
];
export const HrDocToc = () => <DocToc items={items} moduleTitle="HR & Payroll" totalPages={6} />;

import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 0, title: "Process Flow — Employee Lifecycle", page: 3 },
  { num: 1, title: "Employee Management", page: 4 },
  { num: 2, title: "Attendance & Leave", page: 5 },
  { num: 3, title: "Payroll Processing", page: 6 },
  { num: 4, title: "Recruitment & Onboarding", page: 7 },
];
export const HrDocToc = () => <DocToc items={items} moduleTitle="HR & Payroll" totalPages={7} />;

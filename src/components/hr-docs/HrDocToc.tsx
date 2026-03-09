import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 0, title: "Process Flow — Employee Lifecycle", page: 3 },
  { num: 1, title: "Employee Management", page: 4 },
  { num: 2, title: "Doctor & Nurse Management", page: 5 },
  { num: 3, title: "Attendance & Leave", page: 6 },
  { num: 4, title: "Payroll Processing", page: 7 },
  { num: 5, title: "Recruitment & Onboarding", page: 8 },
  { num: 6, title: "Compliance & Licenses", page: 9 },
  { num: 7, title: "HR Letters & Contracts", page: 10 },
  { num: 8, title: "Training & Development", page: 11 },
  { num: 9, title: "Exit Management", page: 12 },
  { num: 10, title: "Safety & Incidents", page: 13 },
  { num: 11, title: "Reports & Analytics", page: 14 },
];
export const HrDocToc = () => <DocToc items={items} moduleTitle="HR & Payroll" totalPages={14} />;

import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 0, title: "Process Flow & Patient Journey", page: 3 },
  { num: 1, title: "Admission — Bed Selection & Form", page: 4 },
  { num: 2, title: "Bed Management & Transfers", page: 5 },
  { num: 3, title: "Daily Rounds & Vitals", page: 6 },
  { num: 4, title: "Nursing Station & Medication Chart", page: 7 },
  { num: 5, title: "Room Charges & Consumables", page: 8 },
  { num: 6, title: "Discharge Workflow & Summary", page: 9 },
];
export const IpdDocToc = () => <DocToc items={items} moduleTitle="IPD Module Guide" totalPages={9} />;

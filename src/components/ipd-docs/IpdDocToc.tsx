import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 1, title: "Admission — Bed Selection & Form", page: 3 },
  { num: 2, title: "Bed Management & Transfers", page: 4 },
  { num: 3, title: "Daily Rounds & Vitals", page: 5 },
  { num: 4, title: "Nursing Station & Medication Chart", page: 6 },
  { num: 5, title: "Room Charges & Consumables", page: 7 },
  { num: 6, title: "Discharge Workflow & Summary", page: 8 },
];
export const IpdDocToc = () => <DocToc items={items} moduleTitle="IPD Module Guide" totalPages={8} />;

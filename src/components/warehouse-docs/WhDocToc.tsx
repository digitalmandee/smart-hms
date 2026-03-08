import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 0, title: "Process Flow — Supply Chain", page: 3 },
  { num: 1, title: "Receiving — GRN, QC & Put-Away", page: 4 },
  { num: 2, title: "Picking, Packing & Shipping", page: 5 },
  { num: 3, title: "Operations — Cycle Count, RTV, Barcode", page: 6 },
  { num: 4, title: "KPI Dashboard & Reports", page: 7 },
];
export const WhDocToc = () => <DocToc items={items} moduleTitle="Warehouse Module Guide" totalPages={7} />;

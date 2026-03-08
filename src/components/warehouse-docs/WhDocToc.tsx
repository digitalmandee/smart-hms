import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 1, title: "Receiving — GRN, QC & Put-Away", page: 3 },
  { num: 2, title: "Picking, Packing & Shipping", page: 4 },
  { num: 3, title: "Operations — Cycle Count, RTV, Barcode", page: 5 },
  { num: 4, title: "KPI Dashboard & Reports", page: 6 },
];
export const WhDocToc = () => <DocToc items={items} moduleTitle="Warehouse Module Guide" totalPages={6} />;

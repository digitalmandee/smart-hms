import { DocPageWrapper, SectionTitle, ProcessFlow } from "@/components/shared-docs/DocPageWrapper";

export const WhDocFlow = () => (
  <DocPageWrapper pageNumber={3} totalPages={7} moduleTitle="Warehouse Module Guide">
    <SectionTitle icon="🔄" title="Warehouse Process Flow" subtitle="End-to-end supply chain operations" />
    <ProcessFlow steps={[
      { icon: "📝", title: "Purchase Order", desc: "Procurement team creates PO based on reorder levels and demand forecasting. Sent to approved vendor for confirmation." },
      { icon: "📦", title: "GRN Receiving", desc: "Goods received at dock. GRN created with quantity verification, batch numbers, expiry dates. Barcode labels generated." },
      { icon: "🔍", title: "Quality Check", desc: "QC team inspects received items for damage, temperature compliance (cold chain), and specification matching. Accept or reject." },
      { icon: "📍", title: "Put-Away", desc: "System assigns optimal bin location based on ABC classification, FEFO rules, and storage conditions. Items shelved with barcode scan." },
      { icon: "🛒", title: "Pick Request", desc: "Department/pharmacy submits transfer request. Pick list generated with optimized route through warehouse zones." },
      { icon: "📋", title: "Packing & Dispatch", desc: "Items packed with delivery note. Barcode verification at packing station. Dispatched to requesting location with tracking." },
      { icon: "🔄", title: "Cycle Count", desc: "Scheduled and spot cycle counts maintain inventory accuracy. Variances investigated and adjustments posted with approval." },
    ]} />
  </DocPageWrapper>
);

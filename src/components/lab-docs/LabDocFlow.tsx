import { DocPageWrapper, SectionTitle, ProcessFlow } from "@/components/shared-docs/DocPageWrapper";

export const LabDocFlow = () => (
  <DocPageWrapper pageNumber={3} totalPages={6} moduleTitle="Laboratory Module Guide">
    <SectionTitle icon="🔄" title="Lab Process Flow" subtitle="Order-to-report laboratory workflow" />
    <ProcessFlow steps={[
      { icon: "👨‍⚕️", title: "Doctor Places Order", desc: "Physician selects tests from catalog during consultation. Order includes clinical notes, urgency flag, and diagnosis code." },
      { icon: "🩸", title: "Sample Collection", desc: "Phlebotomist collects sample with barcode label. Tube type auto-suggested (EDTA, Serum, Citrate). Patient ID verified at collection." },
      { icon: "🏷️", title: "Barcode Labeling & Transport", desc: "Each sample gets a unique barcode linking to order. Samples sorted by department (Hematology, Biochemistry, Microbiology) and transported." },
      { icon: "🔬", title: "Machine Processing", desc: "Samples loaded into analyzers. LIS integration auto-receives results. Bi-directional interface with Roche, Siemens, Abbott instruments." },
      { icon: "📊", title: "Result Entry & Review", desc: "Technician reviews auto-populated results. Delta check against previous values. Out-of-range values flagged with color indicators." },
      { icon: "✅", title: "Pathologist Validation", desc: "Senior pathologist validates critical and abnormal results. Digital signature applied. Panic values trigger instant SMS/notification." },
      { icon: "📄", title: "Report to Doctor", desc: "Validated report appears in doctor's EMR instantly. Patient receives SMS link to view results. PDF report available for download." },
    ]} />
  </DocPageWrapper>
);

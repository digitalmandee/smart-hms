import { DocPageWrapper } from "@/components/pharmacy-docs/DocPageWrapper";
import { ProcessFlow, SectionTitle } from "@/components/shared-docs/DocPageWrapper";

export const PharmDocFlow = () => (
  <DocPageWrapper pageNumber={3} totalPages={19}>
    <SectionTitle icon="🔄" title="Pharmacy Process Flow" subtitle="Prescription-to-dispensing workflow" />
    <ProcessFlow steps={[
      { icon: "📋", title: "Prescription Received", desc: "E-prescription arrives from doctor's EMR or walk-in customer presents paper Rx. Order enters pharmacy dispensing queue." },
      { icon: "🔍", title: "Drug Verification", desc: "Pharmacist reviews prescription for drug interactions, allergies, dosage appropriateness. DUR (Drug Utilization Review) alerts shown." },
      { icon: "📦", title: "Stock Availability Check", desc: "System checks real-time inventory across all locations. Suggests alternatives for out-of-stock items. Batch and expiry verified." },
      { icon: "💊", title: "Dispensing", desc: "Pharmacist picks items from shelf guided by bin location. Barcode scan confirms correct medicine. Label printed with dosage instructions." },
      { icon: "🗣️", title: "Patient Counseling", desc: "Pharmacist counsels patient on dosage, timing, food interactions, and storage. Documented in dispensing record for compliance." },
      { icon: "💳", title: "Billing & Payment", desc: "POS generates invoice with insurance co-pay calculation. Supports cash, card, and split payment. ZATCA e-invoice for KSA." },
      { icon: "📊", title: "Inventory Update", desc: "Stock automatically decremented. Reorder alerts triggered if below minimum. Consumption data feeds procurement forecasting." },
    ]} />
  </DocPageWrapper>
);

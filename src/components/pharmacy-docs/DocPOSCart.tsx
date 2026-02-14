import { DocPageWrapper, SectionTitle, FeatureList, SubSection, TipBox } from "./DocPageWrapper";

export const DocPOSCart = () => (
  <DocPageWrapper pageNumber={8} totalPages={18}>
    <SectionTitle
      icon="🛒"
      title="POS Terminal — Cart & Checkout"
      subtitle="Cart management, patient linking, prescription loading, and hold/recall"
    />

    <SubSection title="Cart Management">
      <FeatureList items={[
        "Adjust quantity with +/- buttons or type directly",
        "Apply line-level discounts (percentage or fixed amount)",
        "Remove individual items with the delete button",
        "Running subtotal, discount total, tax, and grand total update in real-time",
        "All calculations use selling_price for consistency with billing records",
      ]} />
    </SubSection>

    <SubSection title="Patient Linking">
      <FeatureList items={[
        "Search and link a registered patient by name or MR number",
        "Patient details (name, MR#) appear on the receipt and transaction record",
        "Enables 'Pay Later' and 'Post to Patient Profile' billing options",
        "Walk-in customers can proceed without patient linking",
      ]} />
    </SubSection>

    <SubSection title="Prescription Loading">
      <FeatureList items={[
        "Load pending prescriptions from the OPD/IPD prescription queue",
        "All prescribed medicines auto-populate in the cart with correct quantities",
        "OT Medication queue integration for surgical supply requests",
        "Pharmacist can modify quantities or remove items before checkout",
      ]} />
    </SubSection>

    <SubSection title="Hold / Recall Transactions">
      <FeatureList items={[
        "Press F4 or click 'Hold' to save the current cart for later",
        "Held transactions appear in the 'Held' tab with timestamp and patient info",
        "Recall any held transaction to resume where you left off",
        "Multiple transactions can be held simultaneously",
        "Held transactions expire at the end of the POS session",
      ]} />
    </SubSection>

    <SubSection title="Order Review">
      <FeatureList items={[
        "Pre-checkout review screen shows full itemized summary",
        "Verify patient details, quantities, prices, and discounts",
        "Confirm or edit before proceeding to payment",
      ]} />
    </SubSection>

    <TipBox title="Clinical Integration">
      When a prescription is loaded from IPD, the system can automatically 'Post to Patient Profile' — charging the bill to the patient's admission account instead of requiring immediate payment.
    </TipBox>
  </DocPageWrapper>
);

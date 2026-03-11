import { DocPageWrapper, SectionTitle, SubSection, FeatureList, TipBox, MockupTable } from "@/components/pharmacy-docs/DocPageWrapper";

export const FinDemoGuideFixedAssets = ({ totalPages }: { totalPages: number }) => (
  <DocPageWrapper pageNumber={10} totalPages={totalPages}>
    <SectionTitle icon="🏗️" title="Fixed Assets & Depreciation" subtitle="Asset Register with Automated Depreciation" />

    <SubSection title="Asset Register">
      <FeatureList items={[
        "Track all hospital fixed assets: MRI machines, CT scanners, vehicles, furniture",
        "Each asset records: name, category, purchase date, cost, salvage value, useful life",
        "Status tracking: Active, Under Maintenance, Disposed, Written Off",
        "Depreciation method per asset: Straight-Line or Reducing Balance",
      ]} />
    </SubSection>

    <SubSection title="Depreciation Methods">
      <MockupTable
        headers={["Method", "Formula", "Example (100K, 5yr, 10K salvage)"]}
        rows={[
          ["Straight-Line", "(Cost - Salvage) / Useful Life", "18,000 / year"],
          ["Reducing Balance", "Book Value × Rate", "Year 1: 40K, Year 2: 24K..."],
        ]}
      />
    </SubSection>

    <SubSection title="Depreciation Schedule">
      <FeatureList items={[
        "Visual schedule showing year-by-year depreciation and book value",
        "Monthly depreciation calculated automatically",
        "Journal posting: Debit Depreciation Expense, Credit Accumulated Depreciation",
        "Fully depreciated assets flagged but retained in register",
      ]} />
    </SubSection>

    <SubSection title="Asset Lifecycle">
      <FeatureList items={[
        "Purchase → capitalize as fixed asset → start depreciation",
        "Maintenance events tracked with cost and downtime",
        "Disposal/write-off removes from active register",
        "Gain/loss on disposal recorded in GL",
      ]} />
    </SubSection>

    <TipBox title="Demo Route">
      Navigate to /app/accounts/fixed-assets to view the asset register. Click any asset to see its depreciation schedule with year-by-year breakdown.
    </TipBox>
  </DocPageWrapper>
);

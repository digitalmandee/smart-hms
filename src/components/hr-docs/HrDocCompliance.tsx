import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const HrDocCompliance = () => (
  <DocPageWrapper pageNumber={9} totalPages={14} moduleTitle="HR & Payroll">
    <SectionTitle icon="✅" title="Compliance & Licenses" subtitle="Document tracking, medical fitness, vaccinations" />
    <SubSection title="Employee Documents">
      <StepList steps={[
        "Navigate to employee profile → Documents tab",
        "Upload document: select type (National ID, Passport, Degree, Contract)",
        "Enter document number, issue date, expiry date",
        "System categorizes: Identity, Education, Employment, Medical, Legal",
        "Verified by HR manager with timestamp and digital signature",
      ]} />
    </SubSection>
    <SubSection title="Medical Licenses & Certifications">
      <MockupTable headers={["License Type", "Tracking"]} rows={[
        ["Medical License (MBBS/MD)", "License #, authority, issue/expiry dates, renewal alerts"],
        ["Nursing License", "RN/LPN license with state/country authority"],
        ["Pharmacy License", "Pharmacist registration with board verification"],
        ["Lab Technician", "ASCP/AMT certification tracking"],
        ["Radiology Tech", "ARRT certification with CE credits"],
        ["BLS/ACLS/PALS", "Life support certifications with renewal dates"],
      ]} />
    </SubSection>
    <SubSection title="Expiry Tracker Dashboard">
      <FeatureList items={[
        "Centralized view of all expiring documents across organization",
        "Color-coded urgency: Red (expired), Orange (30 days), Yellow (90 days)",
        "Automated email/SMS reminders to employee and HR manager",
        "Filter by document type, department, employee category",
        "Bulk renewal processing for organization-wide certifications",
      ]} />
    </SubSection>
    <SubSection title="Vaccinations & Medical Fitness">
      <FeatureList items={[
        "Vaccination records: Hepatitis B, Flu, COVID-19, Tetanus",
        "Annual medical fitness certificate tracking",
        "Pre-employment health screening checklist",
        "Occupational health records for hazardous area workers",
        "Integration with hospital lab for internal health checkups",
      ]} />
    </SubSection>
    <TipBox title="Regulatory Compliance">All document and license data is maintained per KSA MOH requirements — system generates compliance reports for CBAHI accreditation audits.</TipBox>
  </DocPageWrapper>
);

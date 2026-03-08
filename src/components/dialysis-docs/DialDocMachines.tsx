import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const DialDocMachines = () => (
  <DocPageWrapper pageNumber={6} totalPages={7} moduleTitle="Dialysis Center">
    <SectionTitle icon="⚙️" title="Machine Management" subtitle="Inventory, maintenance, disinfection & allocation" />
    <SubSection title="Machine Registry">
      <MockupTable headers={["Field", "Description"]} rows={[["Machine Number","Unique identifier (e.g., HD-001)"],["Model","Fresenius 5008S, Nipro Surdial X, etc."],["Serial Number","Manufacturer serial for warranty"],["Status","Available / In Use / Maintenance / Retired"],["Isolation","Dedicated for HBsAg+ patients (Yes/No)"],["Last Disinfection","Date/time of last disinfection"]]} />
    </SubSection>
    <SubSection title="Disinfection Workflow">
      <StepList steps={["After each session, nurse initiates machine disinfection","Select disinfection type: Chemical (Citric/Peracetic) or Heat","System logs start time, agent used, concentration","Record end time and verification result (pass/fail)","Machine status auto-updates to 'Available' on pass"]} />
    </SubSection>
    <SubSection title="Maintenance Tracking">
      <FeatureList items={["Preventive maintenance schedule per manufacturer specs","Service history log with technician notes","Parts replacement tracker (dialyzer holders, tubing)","Automated alerts when service is overdue","Downtime tracking with impact on session capacity"]} />
    </SubSection>
    <TipBox title="Machine Allocation">System prevents assigning hepatitis-isolated machines to non-isolated patients and vice versa.</TipBox>
  </DocPageWrapper>
);

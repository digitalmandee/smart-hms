import { DocPageWrapper, SectionTitle, ProcessFlow } from "@/components/shared-docs/DocPageWrapper";

export const HrDocFlow = () => (
  <DocPageWrapper pageNumber={3} totalPages={7} moduleTitle="HR & Payroll">
    <SectionTitle icon="🔄" title="HR & Recruitment Process Flow" subtitle="Hire-to-retire employee lifecycle" />
    <ProcessFlow steps={[
      { icon: "📢", title: "Job Posting", desc: "HR creates job requisition with role details, qualifications, salary band. Published to internal portal and external job boards." },
      { icon: "📋", title: "Application Screening", desc: "Applications collected and screened against criteria. Shortlisted candidates move to interview pipeline with automated notifications." },
      { icon: "🎤", title: "Interview Process", desc: "Multi-round interviews scheduled. Panel feedback recorded digitally. Scoring matrix applied for objective evaluation." },
      { icon: "📨", title: "Offer & Contract", desc: "Offer letter generated with salary, benefits, probation terms. Digital acceptance workflow. Employment contract prepared." },
      { icon: "🏢", title: "Onboarding", desc: "New hire setup: employee ID, biometric enrollment, system access, department assignment. Orientation checklist tracked." },
      { icon: "⏰", title: "Attendance & Leave", desc: "Daily biometric/GPS check-in tracked. Leave requests, approvals, and balance management. Shift roster scheduling." },
      { icon: "💰", title: "Payroll Processing", desc: "Monthly payroll with GOSI deductions, allowances, overtime. WPS file generated for KSA bank transfers. Pay slips distributed." },
      { icon: "📊", title: "Performance Review", desc: "Annual/quarterly performance appraisals. KPI tracking, 360° feedback. Increment and promotion recommendations." },
    ]} />
  </DocPageWrapper>
);

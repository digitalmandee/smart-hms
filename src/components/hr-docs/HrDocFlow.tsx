import { DocPageWrapper, SectionTitle, ProcessFlow } from "@/components/shared-docs/DocPageWrapper";

export const HrDocFlow = () => (
  <DocPageWrapper pageNumber={3} totalPages={14} moduleTitle="HR & Payroll">
    <SectionTitle icon="🔄" title="HR & Recruitment Process Flow" subtitle="Complete hire-to-retire employee lifecycle" />
    <ProcessFlow steps={[
      { icon: "📢", title: "Job Posting", desc: "HR creates job requisition with role details, qualifications, salary band. Published to internal portal and external job boards." },
      { icon: "📋", title: "Screening & Interview", desc: "Applications screened against criteria. Multi-round interviews with scoring matrix. Panel feedback recorded digitally." },
      { icon: "📨", title: "Offer & Contract", desc: "Offer letter generated with salary, benefits, probation terms. Digital acceptance. Employment contract prepared." },
      { icon: "🏢", title: "Onboarding", desc: "Employee ID, biometric enrollment, system access, department assignment. Checklist-based orientation tracked." },
      { icon: "🩺", title: "License & Compliance", desc: "Medical license verification, document upload, vaccination records. Expiry tracker with automated renewal alerts." },
      { icon: "⏰", title: "Attendance & Roster", desc: "Biometric/GPS check-in, duty roster, on-call scheduling. Leave requests, approvals, balance management." },
      { icon: "💰", title: "Payroll & Wallet", desc: "Monthly payroll with GOSI, allowances, overtime. Doctor wallet auto-credited on consultation payment. WPS file generated." },
      { icon: "📊", title: "Performance & Training", desc: "KPI tracking, 360° feedback, CME credits. Mandatory training compliance enforced." },
      { icon: "🎓", title: "Development", desc: "Clinical certifications, skill assessments, career progression tracking. Training budget management." },
      { icon: "🚪", title: "Exit & Settlement", desc: "Resignation → clearance → final settlement with ESB calculation. Exit interview and rehire eligibility flag." },
    ]} />
  </DocPageWrapper>
);

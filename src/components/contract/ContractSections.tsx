import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";

const currentDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const PageHeader = ({ pageNum, total }: { pageNum: number; total: number }) => (
  <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/50">
    <HealthOS24Logo variant="minimal" size="sm" />
    <span className="text-[10px] text-muted-foreground">Page {pageNum} of {total}</span>
  </div>
);

const PageFooter = () => (
  <div className="mt-auto pt-4 border-t border-border/50 flex justify-between text-[9px] text-muted-foreground">
    <span>HealthOS 24 — Confidential</span>
    <span>healthos24.com | +971 506802430</span>
  </div>
);

const TOTAL_PAGES = 9;

// ─── PAGE 1: COVER ───
export const ContractCover = () => (
  <div className="proposal-page flex flex-col justify-between p-12 bg-gradient-to-br from-background via-background to-primary/5">
    <div className="flex items-center justify-between">
      <HealthOS24Logo variant="full" size="lg" showTagline />
      <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">Confidential</span>
    </div>

    <div className="flex-1 flex flex-col justify-center items-center text-center py-16">
      <div className="w-32 h-1.5 bg-gradient-to-r from-primary via-blue-500 to-purple-500 rounded-full mb-8" />
      <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">Service Agreement</h1>
      <p className="text-lg text-muted-foreground mb-12">Software-as-a-Service Subscription Contract</p>

      <div className="bg-card border-2 border-primary/20 rounded-2xl px-12 py-8 shadow-lg space-y-6 w-full max-w-lg">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Service Provider</p>
          <p className="text-xl font-bold text-primary">HealthOS 24</p>
        </div>
        <div className="border-t border-border" />
        <div>
          <p className="text-xs text-muted-foreground mb-1">Client</p>
          <p className="text-xl font-bold text-foreground">Capital Care International Hospital</p>
        </div>
      </div>

      <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>Effective Date: {currentDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Contract Ref: HOS24-CCIH-2026-001</span>
        </div>
      </div>
    </div>

    <div className="border-t border-border pt-6 flex justify-between text-sm">
      <div className="text-muted-foreground">
        <p className="font-medium text-foreground">HealthOS 24</p>
        <p>Enterprise Healthcare Technology</p>
      </div>
      <div className="text-right text-muted-foreground">
        <p className="font-medium text-foreground">healthos24.com</p>
        <p>+971 506802430</p>
      </div>
    </div>
  </div>
);

// ─── PAGE 2: PARTIES & RECITALS ───
export const ContractParties = () => (
  <div className="proposal-page flex flex-col p-10 text-[11px] leading-relaxed text-foreground">
    <PageHeader pageNum={2} total={TOTAL_PAGES} />
    <h2 className="text-xl font-bold mb-6 text-primary">1. Parties & Recitals</h2>

    <div className="space-y-4 text-justify">
      <p className="font-semibold text-sm">1.1 Parties</p>
      <p>This Service Agreement ("Agreement") is entered into as of <strong>{currentDate}</strong> ("Effective Date") by and between:</p>

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <p><strong>Service Provider:</strong> HealthOS 24, a technology company specializing in healthcare management software solutions, with principal offices contactable at healthos24.com and +971 506802430 (hereinafter referred to as "Provider" or "HealthOS 24").</p>
      </div>
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <p><strong>Client:</strong> Capital Care International Hospital, a healthcare institution duly registered and operating under the laws of the Islamic Republic of Pakistan, located in Islamabad, Pakistan (hereinafter referred to as "Client" or "Hospital").</p>
      </div>

      <p className="font-semibold text-sm mt-6">1.2 Recitals</p>
      <p><strong>WHEREAS</strong>, the Provider has developed and operates a comprehensive cloud-based Hospital Management System known as "HealthOS 24" that provides end-to-end digital solutions for healthcare institutions;</p>
      <p><strong>WHEREAS</strong>, the Client desires to subscribe to and utilize the HealthOS 24 platform for managing its hospital operations including but not limited to clinical operations, diagnostics, pharmacy, warehouse management, financial management, and administrative functions;</p>
      <p><strong>WHEREAS</strong>, the Provider has presented a detailed proposal (the "Proposal") outlining the system capabilities, modules, and technical specifications, which the Client has reviewed and accepted;</p>
      <p><strong>WHEREAS</strong>, both parties wish to formalize their agreement regarding the provision, use, and payment for said services on the terms and conditions set forth herein;</p>
      <p><strong>NOW, THEREFORE</strong>, in consideration of the mutual covenants, agreements, and promises contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:</p>

      <p className="font-semibold text-sm mt-6">1.3 Definitions</p>
      <p><strong>"System"</strong> means the HealthOS 24 cloud-based hospital management software platform, including all modules, features, updates, and associated documentation.</p>
      <p><strong>"Services"</strong> means the provision of the System, hosting, maintenance, support, training, and all related services as described herein.</p>
      <p><strong>"Users"</strong> means authorized personnel of the Client who are granted access to the System.</p>
      <p><strong>"OPD"</strong> means Outpatient Department, a distinct clinical unit within the Hospital's operations.</p>
      <p><strong>"SLA"</strong> means Service Level Agreement, defining the performance standards and support commitments.</p>
    </div>
    <PageFooter />
  </div>
);

// ─── PAGE 3: SCOPE OF SERVICES ───
export const ContractScope = () => (
  <div className="proposal-page flex flex-col p-10 text-[11px] leading-relaxed text-foreground">
    <PageHeader pageNum={3} total={TOTAL_PAGES} />
    <h2 className="text-xl font-bold mb-6 text-primary">2. Scope of Services</h2>

    <div className="space-y-4 text-justify">
      <p className="font-semibold text-sm">2.1 System Modules</p>
      <p>The Provider shall deliver and maintain the complete HealthOS 24 platform comprising the following module categories:</p>

      <div className="grid grid-cols-2 gap-3 my-4">
        {[
          { title: "Clinical Operations", items: "OPD Management, IPD/Ward Management, Emergency Department, OT & Surgery, Doctor Portal, Nursing Station, Consultation Management" },
          { title: "Diagnostics & Laboratory", items: "Lab Information System, Radiology (RIS/PACS), Pathology, Sample Tracking, Report Generation, Equipment Integration" },
          { title: "Pharmacy & Inventory", items: "Pharmacy POS, Drug Inventory, Prescription Management, Formulary, Expiry Tracking, Supplier Management" },
          { title: "Warehouse & Supply Chain", items: "Central Store, Purchase Orders, GRN/GIN, Multi-location Transfers, Vendor Management, Asset Tracking" },
          { title: "Finance & Billing", items: "Patient Billing, Insurance Claims, Revenue Cycle, Accounts Receivable/Payable, General Ledger, Financial Reports" },
          { title: "Operations & Admin", items: "HR & Payroll, Attendance, Bed Management, Appointment Scheduling, Kitchen/Dietary, Laundry, Housekeeping, Biomedical Engineering" },
        ].map((cat) => (
          <div key={cat.title} className="bg-muted/40 rounded-lg p-3">
            <p className="font-semibold text-xs text-primary mb-1">{cat.title}</p>
            <p className="text-[10px] text-muted-foreground">{cat.items}</p>
          </div>
        ))}
      </div>

      <p className="font-semibold text-sm">2.2 Infrastructure & Hosting</p>
      <p>The Provider shall host the System on enterprise-grade cloud infrastructure (AWS) with the following provisions:</p>
      <ul className="list-disc ml-5 space-y-1">
        <li>Dedicated cloud environment for the Client</li>
        <li>Automated daily backups with 30-day retention</li>
        <li>SSL/TLS encryption for all data in transit</li>
        <li>AES-256 encryption for data at rest</li>
        <li>Disaster recovery with 4-hour RPO</li>
        <li>Geographic redundancy within the region</li>
      </ul>

      <p className="font-semibold text-sm mt-4">2.3 Support & Maintenance</p>
      <ul className="list-disc ml-5 space-y-1">
        <li>24/7 technical support via ticketing system, email, and phone</li>
        <li>Regular system updates and security patches at no additional cost</li>
        <li>Dedicated account manager for the Client</li>
        <li>Initial implementation support and staff training (up to 40 hours)</li>
        <li>Quarterly business review meetings</li>
      </ul>

      <p className="font-semibold text-sm mt-4">2.4 Exclusions</p>
      <p>The following are not included in this Agreement unless separately agreed: custom hardware procurement, on-premise server installation, third-party software licensing, internet connectivity at Client premises, and custom module development beyond the standard platform.</p>
    </div>
    <PageFooter />
  </div>
);

// ─── PAGE 4: COMMERCIAL TERMS ───
export const ContractCommercial = () => (
  <div className="proposal-page flex flex-col p-10 text-[11px] leading-relaxed text-foreground">
    <PageHeader pageNum={4} total={TOTAL_PAGES} />
    <h2 className="text-xl font-bold mb-6 text-primary">3. Commercial Terms</h2>

    <div className="space-y-4 text-justify">
      <p className="font-semibold text-sm">3.1 Subscription Fee</p>
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 my-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-sm">Monthly Subscription</span>
          <span className="text-2xl font-bold text-primary">PKR 315,000/month</span>
        </div>
        <div className="border-t border-primary/10 pt-3 space-y-2 text-[10px]">
          <p>The monthly subscription fee includes:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Full access to all HealthOS 24 modules listed in Section 2.1</li>
            <li>Up to <strong>50 concurrent system users</strong></li>
            <li>Up to <strong>500 active patient profiles</strong> per month</li>
            <li>AWS cloud hosting, maintenance, and backups</li>
            <li>24/7 technical support and SLA coverage</li>
            <li>All software updates and new feature releases</li>
          </ul>
        </div>
      </div>

      <p className="font-semibold text-sm">3.2 Expansion Pricing</p>
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 my-4">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold text-sm">New OPD Department</span>
          <span className="text-xl font-bold text-blue-600">PKR 50,000/OPD/month</span>
        </div>
        <p className="text-[10px] text-muted-foreground">For each additional Outpatient Department added to the Hospital's operations after the Effective Date, an incremental monthly fee of PKR 50,000 shall be applied. This includes full module configuration, user access, and support for the new OPD.</p>
      </div>

      <p className="font-semibold text-sm">3.3 Payment Terms</p>
      <ul className="list-disc ml-5 space-y-1">
        <li>Invoices shall be issued on the <strong>1st of each calendar month</strong> in advance.</li>
        <li>Payment is due within <strong>seven (7) business days</strong> of invoice date.</li>
        <li>All payments shall be made in Pakistani Rupees (PKR) via bank transfer to the Provider's designated account.</li>
        <li>The Provider reserves the right to revise pricing with <strong>sixty (60) days' written notice</strong>, effective at the next renewal period.</li>
      </ul>

      <p className="font-semibold text-sm mt-4">3.4 Late Payment</p>
      <ul className="list-disc ml-5 space-y-1">
        <li>A late payment surcharge of <strong>2% per month</strong> shall be applied on overdue amounts after a 7-day grace period.</li>
        <li>If payment remains outstanding for more than <strong>thirty (30) days</strong>, the Provider may suspend access to the System with 7 days' written notice.</li>
        <li>Restoration of suspended services shall require full settlement of outstanding dues plus a reactivation fee of PKR 25,000.</li>
      </ul>

      <p className="font-semibold text-sm mt-4">3.5 Taxes</p>
      <p>All fees are exclusive of applicable taxes. Any sales tax, withholding tax, or government levy applicable shall be borne by the Client and added to the invoice amount as required by Pakistani law.</p>
    </div>
    <PageFooter />
  </div>
);

// ─── PAGE 5: TERM & TERMINATION ───
export const ContractTerm = () => (
  <div className="proposal-page flex flex-col p-10 text-[11px] leading-relaxed text-foreground">
    <PageHeader pageNum={5} total={TOTAL_PAGES} />
    <h2 className="text-xl font-bold mb-6 text-primary">4. Term & Termination</h2>

    <div className="space-y-4 text-justify">
      <p className="font-semibold text-sm">4.1 Initial Term</p>
      <p>This Agreement shall commence on the Effective Date and continue for an initial period of <strong>twelve (12) months</strong> ("Initial Term").</p>

      <p className="font-semibold text-sm">4.2 Renewal</p>
      <p>Upon expiration of the Initial Term, this Agreement shall automatically renew for successive periods of twelve (12) months each ("Renewal Term"), unless either party provides written notice of non-renewal at least <strong>ninety (90) days</strong> prior to the end of the then-current term.</p>

      <p className="font-semibold text-sm">4.3 Termination for Cause</p>
      <p>Either party may terminate this Agreement immediately upon written notice if:</p>
      <ul className="list-[lower-alpha] ml-5 space-y-1">
        <li>The other party commits a material breach of this Agreement and fails to cure such breach within <strong>thirty (30) days</strong> of receiving written notice thereof;</li>
        <li>The other party becomes insolvent, files for bankruptcy, or enters into liquidation;</li>
        <li>The other party engages in conduct that materially damages the reputation of the terminating party;</li>
        <li>Force Majeure conditions (as defined in Section 7.1) persist for more than sixty (60) consecutive days.</li>
      </ul>

      <p className="font-semibold text-sm mt-4">4.4 Termination for Convenience</p>
      <p>The Client may terminate this Agreement for convenience by providing <strong>ninety (90) days'</strong> written notice to the Provider. In such case, the Client shall pay all fees accrued through the termination date plus an early termination fee equal to <strong>three (3) months'</strong> subscription fees.</p>

      <p className="font-semibold text-sm mt-4">4.5 Effects of Termination</p>
      <p>Upon termination or expiration of this Agreement:</p>
      <ul className="list-[lower-alpha] ml-5 space-y-1">
        <li>The Client's access to the System shall be revoked within <strong>thirty (30) days</strong> of the termination effective date;</li>
        <li>The Provider shall export and deliver all Client data in a standard machine-readable format (CSV/JSON) within <strong>thirty (30) days</strong> of termination;</li>
        <li>All Client data on the Provider's systems shall be permanently deleted within <strong>sixty (60) days</strong> of termination, unless required by law to retain;</li>
        <li>All outstanding payment obligations shall survive termination;</li>
        <li>Confidentiality obligations shall survive for <strong>three (3) years</strong> beyond termination.</li>
      </ul>

      <p className="font-semibold text-sm mt-4">4.6 Transition Assistance</p>
      <p>Upon request, the Provider shall provide reasonable transition assistance for up to <strong>sixty (60) days</strong> following termination at its then-current professional services rates. This includes data migration support, documentation handover, and knowledge transfer sessions.</p>
    </div>
    <PageFooter />
  </div>
);

// ─── PAGE 6: SLA & SUPPORT ───
export const ContractSLA = () => (
  <div className="proposal-page flex flex-col p-10 text-[11px] leading-relaxed text-foreground">
    <PageHeader pageNum={6} total={TOTAL_PAGES} />
    <h2 className="text-xl font-bold mb-6 text-primary">5. Service Level Agreement</h2>

    <div className="space-y-4 text-justify">
      <p className="font-semibold text-sm">5.1 Uptime Guarantee</p>
      <p>The Provider guarantees a minimum system availability of <strong>99.9%</strong> per calendar month, measured across all production system components. Uptime is calculated as:</p>
      <div className="bg-muted/50 rounded-lg p-3 text-center my-2 font-mono text-xs">
        Uptime % = ((Total Minutes − Downtime Minutes) / Total Minutes) × 100
      </div>

      <p className="font-semibold text-sm">5.2 Scheduled Maintenance</p>
      <p>Scheduled maintenance windows shall occur between <strong>02:00 AM — 05:00 AM PKT</strong> on Sundays, with at least 48 hours' prior notice. Scheduled maintenance is excluded from uptime calculations.</p>

      <p className="font-semibold text-sm">5.3 Incident Response Times</p>
      <table className="w-full border-collapse my-3 text-[10px]">
        <thead>
          <tr className="bg-primary/10">
            <th className="border border-border/50 p-2 text-left">Severity</th>
            <th className="border border-border/50 p-2 text-left">Description</th>
            <th className="border border-border/50 p-2 text-left">Response</th>
            <th className="border border-border/50 p-2 text-left">Resolution Target</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="border border-border/50 p-2 font-semibold text-red-600">Critical (P1)</td><td className="border border-border/50 p-2">System down or data loss risk</td><td className="border border-border/50 p-2">1 hour</td><td className="border border-border/50 p-2">4 hours</td></tr>
          <tr><td className="border border-border/50 p-2 font-semibold text-orange-600">High (P2)</td><td className="border border-border/50 p-2">Major feature unavailable</td><td className="border border-border/50 p-2">2 hours</td><td className="border border-border/50 p-2">8 hours</td></tr>
          <tr><td className="border border-border/50 p-2 font-semibold text-yellow-600">Medium (P3)</td><td className="border border-border/50 p-2">Non-critical feature impacted</td><td className="border border-border/50 p-2">4 hours</td><td className="border border-border/50 p-2">24 hours</td></tr>
          <tr><td className="border border-border/50 p-2 font-semibold text-blue-600">Low (P4)</td><td className="border border-border/50 p-2">Minor issue or enhancement</td><td className="border border-border/50 p-2">8 hours</td><td className="border border-border/50 p-2">5 business days</td></tr>
        </tbody>
      </table>

      <p className="font-semibold text-sm">5.4 SLA Credits</p>
      <p>If the Provider fails to meet the uptime guarantee, the Client shall be entitled to service credits:</p>
      <table className="w-full border-collapse my-3 text-[10px]">
        <thead>
          <tr className="bg-primary/10">
            <th className="border border-border/50 p-2 text-left">Monthly Uptime</th>
            <th className="border border-border/50 p-2 text-left">Service Credit</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="border border-border/50 p-2">99.0% – 99.9%</td><td className="border border-border/50 p-2">5% of monthly fee</td></tr>
          <tr><td className="border border-border/50 p-2">95.0% – 99.0%</td><td className="border border-border/50 p-2">15% of monthly fee</td></tr>
          <tr><td className="border border-border/50 p-2">Below 95.0%</td><td className="border border-border/50 p-2">30% of monthly fee</td></tr>
        </tbody>
      </table>
      <p>Service credits are the Client's sole remedy for downtime and shall be applied against future invoices. Maximum credit per month shall not exceed 30% of that month's fees.</p>

      <p className="font-semibold text-sm mt-4">5.5 Support Channels</p>
      <ul className="list-disc ml-5 space-y-1">
        <li><strong>24/7 Emergency Hotline</strong> — for P1 and P2 issues</li>
        <li><strong>Ticketing Portal</strong> — healthos24.com/support — all severity levels</li>
        <li><strong>Email Support</strong> — support@healthos24.com — response within SLA targets</li>
        <li><strong>Dedicated Account Manager</strong> — for escalations and quarterly reviews</li>
      </ul>
    </div>
    <PageFooter />
  </div>
);

// ─── PAGE 7: DATA, SECURITY & CONFIDENTIALITY ───
export const ContractSecurity = () => (
  <div className="proposal-page flex flex-col p-10 text-[11px] leading-relaxed text-foreground">
    <PageHeader pageNum={7} total={TOTAL_PAGES} />
    <h2 className="text-xl font-bold mb-6 text-primary">6. Data, Security & Confidentiality</h2>

    <div className="space-y-4 text-justify">
      <p className="font-semibold text-sm">6.1 Data Ownership</p>
      <p>All data entered, generated, or stored by the Client within the System ("Client Data") is and shall remain the exclusive property of the Client. The Provider acquires no rights, title, or interest in Client Data except the limited right to process it for the purpose of providing the Services.</p>

      <p className="font-semibold text-sm">6.2 Data Protection</p>
      <p>The Provider shall implement and maintain the following security measures:</p>
      <ul className="list-disc ml-5 space-y-1">
        <li><strong>Encryption in Transit:</strong> TLS 1.3 for all communications between Client devices and the System</li>
        <li><strong>Encryption at Rest:</strong> AES-256 encryption for all stored data including backups</li>
        <li><strong>Access Controls:</strong> Role-based access control (RBAC) with multi-factor authentication (MFA)</li>
        <li><strong>Audit Logging:</strong> Comprehensive audit trails for all data access and modifications, retained for 12 months</li>
        <li><strong>Penetration Testing:</strong> Annual third-party security assessments</li>
        <li><strong>Vulnerability Management:</strong> Continuous monitoring with critical patches applied within 24 hours</li>
      </ul>

      <p className="font-semibold text-sm mt-4">6.3 Regulatory Compliance</p>
      <p>The Provider shall maintain compliance with:</p>
      <ul className="list-disc ml-5 space-y-1">
        <li>HIPAA-aligned practices for protected health information (PHI)</li>
        <li>Pakistan's Prevention of Electronic Crimes Act (PECA) 2016</li>
        <li>ISO 27001 information security management principles</li>
        <li>Any applicable healthcare data regulations in Pakistan</li>
      </ul>

      <p className="font-semibold text-sm mt-4">6.4 Confidentiality</p>
      <p>Each party agrees to maintain the confidentiality of all non-public information received from the other party ("Confidential Information"). Neither party shall disclose Confidential Information to any third party without prior written consent, except:</p>
      <ul className="list-[lower-alpha] ml-5 space-y-1">
        <li>To employees or contractors who need to know and are bound by confidentiality obligations;</li>
        <li>As required by law, regulation, or court order (with prompt notice to the disclosing party);</li>
        <li>Information that becomes publicly available through no fault of the receiving party.</li>
      </ul>

      <p className="font-semibold text-sm mt-4">6.5 Data Breach Notification</p>
      <p>In the event of a security breach affecting Client Data, the Provider shall:</p>
      <ul className="list-[lower-alpha] ml-5 space-y-1">
        <li>Notify the Client within <strong>twenty-four (24) hours</strong> of discovery;</li>
        <li>Provide a detailed incident report within <strong>seventy-two (72) hours</strong>;</li>
        <li>Take immediate remedial action to contain and resolve the breach;</li>
        <li>Cooperate fully with the Client's investigation and any regulatory inquiries.</li>
      </ul>

      <p className="font-semibold text-sm mt-4">6.6 Data Backup & Recovery</p>
      <p>The Provider shall perform automated daily backups with a minimum retention period of 30 days. Point-in-time recovery capability shall be maintained with a Recovery Point Objective (RPO) of 4 hours and a Recovery Time Objective (RTO) of 2 hours.</p>
    </div>
    <PageFooter />
  </div>
);

// ─── PAGE 8: GENERAL CLAUSES ───
export const ContractGeneral = () => (
  <div className="proposal-page flex flex-col p-10 text-[11px] leading-relaxed text-foreground">
    <PageHeader pageNum={8} total={TOTAL_PAGES} />
    <h2 className="text-xl font-bold mb-6 text-primary">7. General Provisions</h2>

    <div className="space-y-4 text-justify">
      <p className="font-semibold text-sm">7.1 Force Majeure</p>
      <p>Neither party shall be liable for any failure or delay in performance due to causes beyond its reasonable control, including but not limited to natural disasters, war, terrorism, pandemics, government actions, power failures, internet outages, or cyberattacks. The affected party shall promptly notify the other party and use reasonable efforts to mitigate the impact.</p>

      <p className="font-semibold text-sm">7.2 Governing Law</p>
      <p>This Agreement shall be governed by and construed in accordance with the laws of the <strong>Islamic Republic of Pakistan</strong>, without regard to its conflict of law principles.</p>

      <p className="font-semibold text-sm">7.3 Dispute Resolution</p>
      <p>Any dispute arising out of or in connection with this Agreement shall be resolved as follows:</p>
      <ul className="list-[lower-alpha] ml-5 space-y-1">
        <li><strong>Negotiation:</strong> The parties shall first attempt to resolve the dispute through good-faith negotiation within thirty (30) days;</li>
        <li><strong>Mediation:</strong> If negotiation fails, the dispute shall be submitted to mediation under the rules of the Islamabad Chamber of Commerce;</li>
        <li><strong>Arbitration:</strong> If mediation fails, the dispute shall be finally resolved by binding arbitration under the Arbitration Act 1940, with the seat of arbitration in Islamabad, Pakistan. The arbitration shall be conducted by a single arbitrator mutually agreed upon by the parties.</li>
      </ul>

      <p className="font-semibold text-sm mt-4">7.4 Limitation of Liability</p>
      <p>The Provider's total aggregate liability under this Agreement shall not exceed the total fees paid by the Client during the <strong>twelve (12) months</strong> immediately preceding the claim. Neither party shall be liable for indirect, incidental, consequential, or punitive damages.</p>

      <p className="font-semibold text-sm mt-4">7.5 Indemnification</p>
      <p>Each party shall indemnify and hold harmless the other party from any third-party claims, damages, or expenses arising from the indemnifying party's breach of this Agreement, negligence, or willful misconduct.</p>

      <p className="font-semibold text-sm mt-4">7.6 Amendments</p>
      <p>This Agreement may only be amended or modified by a written instrument signed by authorized representatives of both parties. No oral modifications shall be binding.</p>

      <p className="font-semibold text-sm mt-4">7.7 Assignment</p>
      <p>Neither party may assign this Agreement without the prior written consent of the other party, except in connection with a merger, acquisition, or sale of substantially all assets. Any attempted assignment without consent shall be void.</p>

      <p className="font-semibold text-sm mt-4">7.8 Severability</p>
      <p>If any provision of this Agreement is held invalid or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.</p>

      <p className="font-semibold text-sm mt-4">7.9 Entire Agreement</p>
      <p>This Agreement, together with any schedules, annexures, and the referenced Proposal, constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, and agreements, whether written or oral.</p>

      <p className="font-semibold text-sm mt-4">7.10 Notices</p>
      <p>All notices under this Agreement shall be in writing and sent to the addresses specified herein or as updated by either party. Notices may be delivered by hand, registered mail, or email with read receipt confirmation.</p>
    </div>
    <PageFooter />
  </div>
);

// ─── PAGE 9: SIGNATURE BLOCK ───
export const ContractSignature = () => (
  <div className="proposal-page flex flex-col p-10 text-[11px] leading-relaxed text-foreground">
    <PageHeader pageNum={9} total={TOTAL_PAGES} />
    <h2 className="text-xl font-bold mb-6 text-primary">8. Execution</h2>

    <div className="space-y-6 text-justify">
      <p>IN WITNESS WHEREOF, the parties hereto have executed this Service Agreement as of the date first written above, by their duly authorized representatives.</p>

      <div className="grid grid-cols-2 gap-8 mt-10">
        {/* Provider */}
        <div className="space-y-8">
          <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">SERVICE PROVIDER</p>
            <p className="text-lg font-bold text-primary mb-4">HealthOS 24</p>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Authorized Signatory</p>
                <div className="border-b-2 border-foreground/30 h-12" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Name</p>
                <div className="border-b border-border h-8" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Title / Designation</p>
                <div className="border-b border-border h-8" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Date</p>
                <div className="border-b border-border h-8" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Company Stamp</p>
                <div className="border border-dashed border-border rounded-lg h-24 flex items-center justify-center text-[10px] text-muted-foreground">[Official Stamp]</div>
              </div>
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="space-y-8">
          <div className="bg-muted/50 rounded-xl p-6 border border-border">
            <p className="text-xs text-muted-foreground mb-1">CLIENT</p>
            <p className="text-lg font-bold text-foreground mb-4">Capital Care International Hospital</p>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Authorized Signatory</p>
                <div className="border-b-2 border-foreground/30 h-12" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Name</p>
                <div className="border-b border-border h-8" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Title / Designation</p>
                <div className="border-b border-border h-8" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Date</p>
                <div className="border-b border-border h-8" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Company Stamp</p>
                <div className="border border-dashed border-border rounded-lg h-24 flex items-center justify-center text-[10px] text-muted-foreground">[Official Stamp]</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-[10px] text-muted-foreground border-t border-border pt-4">
        <p>This Agreement is executed in two (2) original copies, one for each party.</p>
        <p className="mt-1">Contract Reference: HOS24-CCIH-2026-001</p>
      </div>
    </div>
    <PageFooter />
  </div>
);

export const contractPages = [
  { id: "cover", label: "Cover", component: ContractCover },
  { id: "parties", label: "Parties & Recitals", component: ContractParties },
  { id: "scope", label: "Scope of Services", component: ContractScope },
  { id: "commercial", label: "Commercial Terms", component: ContractCommercial },
  { id: "term", label: "Term & Termination", component: ContractTerm },
  { id: "sla", label: "SLA & Support", component: ContractSLA },
  { id: "security", label: "Data & Security", component: ContractSecurity },
  { id: "general", label: "General Provisions", component: ContractGeneral },
  { id: "signature", label: "Signature", component: ContractSignature },
];

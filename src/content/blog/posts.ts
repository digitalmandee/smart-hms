// 20 SEO-optimized blog posts for HealthOS 24.
// Each post is structured (no markdown runtime needed) and rendered as semantic HTML.

export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string; // meta description, <160 chars
  keywords: string[];
  category:
    | "Hospital Management"
    | "KSA Compliance"
    | "Pharmacy"
    | "Clinical Workflow"
    | "Finance & HR";
  publishedAt: string; // ISO date
  readingMinutes: number;
  intro: string;
  sections: BlogSection[];
  conclusion: string;
  faq?: { q: string; a: string }[];
  relatedLinks: { label: string; href: string }[];
}

export const posts: BlogPost[] = [
  {
    slug: "what-is-hospital-management-system",
    title: "What Is a Hospital Management System? A Complete 2026 Guide",
    description:
      "A hospital management system (HMS) digitizes clinical, pharmacy, billing and HR workflows. Learn what it is, how it works, and how to choose one in 2026.",
    keywords: ["hospital management system", "what is hms", "hospital software", "HIS"],
    category: "Hospital Management",
    publishedAt: "2026-05-10",
    readingMinutes: 8,
    intro:
      "A Hospital Management System (HMS) is the operational backbone of a modern healthcare facility. It connects patient registration, clinical care, pharmacy, lab, radiology, billing and HR into one auditable system so doctors, nurses and finance teams stop working from spreadsheets and disconnected tools.",
    sections: [
      {
        heading: "Core modules every HMS should have",
        paragraphs: [
          "At minimum, a credible HMS covers four pillars: patient administration, clinical care, ancillary services and finance. Anything less and you'll end up patching the gaps with manual workflows that fail audits.",
        ],
        bullets: [
          "Patient registration, OPD and IPD management",
          "EMR with vitals, notes, prescriptions and orders",
          "Pharmacy POS, dispensing and inventory with FIFO/expiry",
          "Laboratory and radiology orders with result reporting",
          "Billing, invoicing, deposits and insurance claims",
          "Accounting, HR, payroll and asset management",
        ],
      },
      {
        heading: "How an HMS reduces revenue leakage",
        paragraphs: [
          "Manual billing loses 3–8% of revenue to missed charges. A proper HMS auto-loads unbilled lab orders, imaging, ward charges and consumables onto the discharge invoice so nothing slips. Combined with role-based access and daily closing, it makes shrinkage visible immediately.",
        ],
      },
      {
        heading: "Cloud vs on-premise in 2026",
        paragraphs: [
          "Most new hospitals deploy cloud-first. The maintenance, backup and compliance burden of running on-premise servers no longer pays off unless local regulations explicitly require it. Cloud HMS platforms now ship with regional data residency, encryption at rest and HIPAA-aligned access controls out of the box.",
        ],
      },
    ],
    conclusion:
      "The right HMS pays for itself within 12 months through faster collections, fewer billing errors and shorter patient wait times. Start with a free demo and benchmark your current revenue cycle against what the system can automate.",
    faq: [
      {
        q: "Is an HMS the same as an EMR?",
        a: "No. An EMR (Electronic Medical Record) only stores clinical data. An HMS includes the EMR plus billing, pharmacy, HR, inventory and accounting.",
      },
      {
        q: "How long does HMS implementation take?",
        a: "A single-branch hospital can go live in 4–8 weeks with a modern cloud HMS. Multi-branch or multi-country rollouts take 3–6 months.",
      },
    ],
    relatedLinks: [
      { label: "System Overview", href: "/system-overview" },
      { label: "Pricing Proposal", href: "/pricing-proposal" },
    ],
  },
  {
    slug: "hms-vs-emr-vs-ehr",
    title: "HMS vs EMR vs EHR: Differences Hospitals Actually Care About",
    description:
      "HMS, EMR and EHR are not interchangeable. Compare scope, ownership and use cases so you pick the right system for your hospital or clinic.",
    keywords: ["hms vs emr", "emr vs ehr", "hospital information system"],
    category: "Hospital Management",
    publishedAt: "2026-05-11",
    readingMinutes: 6,
    intro:
      "Vendors use HMS, HIS, EMR and EHR interchangeably, but they mean different things in practice. Choosing the wrong category locks you into a system that can't do what you actually need.",
    sections: [
      {
        heading: "Quick definitions",
        paragraphs: [
          "EMR is the digital chart for a single facility. EHR extends that chart across facilities and is interoperable with national health exchanges. HMS is operational software covering both clinical and non-clinical workflows: billing, HR, inventory, accounting.",
        ],
      },
      {
        heading: "When you need an HMS, not just an EMR",
        paragraphs: [
          "If you bill insurance, run a pharmacy, employ staff or manage inventory, an EMR alone won't run the business. You'll either bolt on disconnected modules or end up with two sources of truth.",
        ],
      },
      {
        heading: "When EHR matters",
        paragraphs: [
          "EHR matters when patients move between providers and you must exchange records. In Saudi Arabia this means NPHIES integration; in the US, HL7 FHIR; in the UAE, Riayati. A modern HMS should expose EHR-compatible APIs by default.",
        ],
      },
    ],
    conclusion:
      "Decide based on scope, not labels. Ask vendors which workflows they own end-to-end and which they hand off to integrations.",
    relatedLinks: [
      { label: "KSA Compliance Documentation", href: "/ksa-documentation" },
      { label: "System Overview", href: "/system-overview" },
    ],
  },
  {
    slug: "hospital-software-features-2026",
    title: "12 Must-Have Features in Modern Hospital Software",
    description:
      "Skip the bloated feature lists. These 12 capabilities separate a real hospital management system from a glorified appointment app.",
    keywords: ["hospital software features", "hospital management software", "HMS checklist"],
    category: "Hospital Management",
    publishedAt: "2026-05-12",
    readingMinutes: 7,
    intro:
      "Most HMS demos overwhelm buyers with feature checklists. Here is the short list that actually predicts whether the software will work for a real hospital.",
    sections: [
      {
        heading: "The 12 features that matter",
        paragraphs: ["Anything missing from this list will create operational pain within the first quarter."],
        bullets: [
          "Role-based access with audit trail on every record",
          "OPD token queue with public TV displays",
          "IPD admission, bed management and discharge",
          "Pharmacy POS with barcode dispensing and returns",
          "Lab order to result lifecycle with sample tracking",
          "Radiology PACS-ready reporting workflow",
          "Insurance pre-authorisation and claim scrubbing",
          "GRN to GL accounting auto-posting",
          "Daily closing and reconciliation with shift handover",
          "Multi-branch with per-branch chart of accounts",
          "Patient portal and mobile app",
          "Native multilingual UI (English, Arabic, Urdu, etc.)",
        ],
      },
    ],
    conclusion:
      "If a vendor cannot demo each of these end-to-end on real data in under 30 minutes, the feature exists in a brochure, not in the product.",
    relatedLinks: [
      { label: "Documentation Hub", href: "/documentation" },
      { label: "Executive Presentation", href: "/executive-presentation" },
    ],
  },
  {
    slug: "cloud-vs-on-premise-hms",
    title: "Cloud HMS vs On-Premise: Cost, Security & Scale Compared",
    description:
      "A side-by-side comparison of cloud and on-premise hospital management systems on cost, security, uptime, compliance and scale.",
    keywords: ["cloud hospital management system", "on-premise hms", "saas hms"],
    category: "Hospital Management",
    publishedAt: "2026-05-13",
    readingMinutes: 7,
    intro:
      "Cloud HMS adoption crossed 70% globally in 2025. But on-premise deployments still make sense in narrow scenarios. Here is when each wins.",
    sections: [
      {
        heading: "Total cost of ownership",
        paragraphs: [
          "On-premise hides the real cost behind capital expenditure. Once you factor in server hardware refresh every 4 years, dedicated IT staff, UPS, cooling and disaster recovery, cloud is 35–50% cheaper across a 5-year window for hospitals under 300 beds.",
        ],
      },
      {
        heading: "Security and compliance",
        paragraphs: [
          "Cloud providers ship SOC 2, HIPAA, ISO 27001 and regional residency controls by default. Replicating that on-premise requires a security team most hospitals cannot justify.",
        ],
      },
      {
        heading: "When on-premise still wins",
        paragraphs: [
          "Government hospitals with strict data localisation laws, facilities in regions with unreliable internet, or sites that must run during multi-day outages. Even then, a hybrid model (on-premise edge + cloud sync) usually beats pure on-premise.",
        ],
      },
    ],
    conclusion:
      "Default to cloud unless regulations or connectivity force your hand. Hybrid is the right compromise when both apply.",
    relatedLinks: [
      { label: "Pricing Proposal", href: "/pricing-proposal" },
      { label: "Service Contract", href: "/contract" },
    ],
  },
  {
    slug: "multi-branch-hospital-software",
    title: "How to Choose an HMS for a Multi-Branch Hospital",
    description:
      "Multi-branch hospitals need centralised accounting, per-branch operations and consolidated reporting. Use this checklist to evaluate vendors.",
    keywords: ["multi branch hospital software", "hospital chain hms", "centralised hospital management"],
    category: "Hospital Management",
    publishedAt: "2026-05-14",
    readingMinutes: 6,
    intro:
      "Most HMS products are built for a single site and then patched for multi-branch. The patches show. Here is how to spot a system designed for chains from day one.",
    sections: [
      {
        heading: "Non-negotiables for chains",
        paragraphs: ["A true multi-branch HMS handles these without custom code:"],
        bullets: [
          "Single sign-on across all branches",
          "Per-branch chart of accounts with consolidated reporting",
          "Cross-branch inventory transfers with stock-in-transit ledger",
          "Patient records visible across branches with consent rules",
          "Branch-level KPIs alongside group dashboards",
          "Daily closing per branch, monthly consolidation at group",
        ],
      },
      {
        heading: "Red flags",
        paragraphs: [
          "If the vendor demos by switching browsers or logging in to different URLs per branch, walk away. Real multi-tenant HMS scopes branches inside one session.",
        ],
      },
    ],
    conclusion:
      "Build a 90-day pilot with two branches before signing a group contract. Multi-branch problems surface at the consolidation layer, not in single-site demos.",
    relatedLinks: [
      { label: "Executive Presentation", href: "/executive-presentation" },
      { label: "Finance Documentation", href: "/finance-documentation" },
    ],
  },
  {
    slug: "nphies-integration-saudi-hospitals",
    title: "NPHIES Integration Explained for Saudi Hospitals",
    description:
      "NPHIES is mandatory for Saudi healthcare claims. Understand FHIR messaging, eligibility, pre-authorisation and claim submission step by step.",
    keywords: ["nphies integration", "saudi insurance claims", "nphies fhir", "ksa insurance"],
    category: "KSA Compliance",
    publishedAt: "2026-05-15",
    readingMinutes: 9,
    intro:
      "NPHIES (National Platform for Health Information Exchange Services) is the Council of Health Insurance's mandatory exchange for every insurance claim in Saudi Arabia. Without NPHIES integration, your hospital cannot get paid for insured patients.",
    sections: [
      {
        heading: "What NPHIES covers",
        paragraphs: [
          "NPHIES handles four main transactions: eligibility, pre-authorisation, claim submission and payment reconciliation. All exchanged over HL7 FHIR R4 with strict data quality rules.",
        ],
      },
      {
        heading: "Common integration pitfalls",
        paragraphs: [
          "Hospitals routinely fail NPHIES validation because of three issues: wrong medical codes (ICD-10-AM, SCT-KSA), missing supporting documents, and incorrect provider/payer identifiers. A modern HMS validates payloads before submission and shows the rejection reason inline.",
        ],
      },
      {
        heading: "How to test integration",
        paragraphs: [
          "Always validate in the NPHIES sandbox first. Cover eligibility, pre-auth approval, pre-auth rejection, claim approval, claim partial-approval and claim rejection scenarios. Your HMS should handle each path without manual intervention.",
        ],
      },
    ],
    conclusion:
      "NPHIES is not a one-time integration; coding standards and templates update quarterly. Pick an HMS vendor that absorbs those updates as part of subscription, not as paid change requests.",
    relatedLinks: [
      { label: "KSA Compliance Documentation", href: "/ksa-documentation" },
      { label: "System Overview", href: "/system-overview" },
    ],
  },
  {
    slug: "zatca-phase-2-healthcare",
    title: "ZATCA Phase 2 E-Invoicing for Healthcare Providers",
    description:
      "ZATCA Phase 2 requires UBL 2.1 XML invoices with cryptographic chaining. Here's what hospitals and clinics in Saudi Arabia must implement.",
    keywords: ["zatca e-invoicing healthcare", "zatca phase 2", "fatoora hospital"],
    category: "KSA Compliance",
    publishedAt: "2026-05-16",
    readingMinutes: 8,
    intro:
      "ZATCA Phase 2 (Integration phase) is now enforced across Saudi Arabia in staged waves. Hospitals and clinics must issue cryptographically chained UBL 2.1 XML invoices and clear them through Fatoora in real time.",
    sections: [
      {
        heading: "Phase 1 vs Phase 2",
        paragraphs: [
          "Phase 1 (Generation) only required structured electronic invoices with QR codes. Phase 2 (Integration) adds real-time clearance for B2B and reporting within 24 hours for B2C, mandatory cryptographic stamps and chaining via PIH (Previous Invoice Hash).",
        ],
      },
      {
        heading: "What your HMS must do",
        paragraphs: ["Every patient invoice must:"],
        bullets: [
          "Be generated as UBL 2.1 XML",
          "Embed a SHA-256 hash of the previous invoice (PIH)",
          "Carry a cryptographic stamp from the onboarded CSID",
          "Display a TLV-encoded QR code on the printed receipt",
          "Be archived for 6 years and retrievable on demand",
        ],
      },
      {
        heading: "Penalties for non-compliance",
        paragraphs: [
          "Fines start at SAR 1,000 per violation and escalate. Repeated violations trigger licence reviews. Manual workarounds are not viable at hospital invoice volume.",
        ],
      },
    ],
    conclusion:
      "ZATCA Phase 2 is a solved problem in modern HMS platforms. If your current vendor still asks for change requests, it is time to switch.",
    relatedLinks: [
      { label: "KSA Compliance Documentation", href: "/ksa-documentation" },
      { label: "Finance Documentation", href: "/finance-documentation" },
    ],
  },
  {
    slug: "wasfaty-eprescription-guide",
    title: "Wasfaty E-Prescription: A Practical Implementation Guide",
    description:
      "Wasfaty is Saudi Arabia's national e-prescription network. Learn how to integrate your HMS, dispense at partner pharmacies and handle exceptions.",
    keywords: ["wasfaty integration", "wasfaty e-prescription", "saudi e-prescription"],
    category: "KSA Compliance",
    publishedAt: "2026-05-17",
    readingMinutes: 7,
    intro:
      "Wasfaty connects prescribers, MOH-approved pharmacies and patients into one digital prescription network. For most Saudi hospitals, Wasfaty integration is now mandatory for outpatient prescriptions.",
    sections: [
      {
        heading: "The Wasfaty flow",
        paragraphs: [
          "Doctor writes prescription in the HMS, system transmits it to Wasfaty, patient receives SMS with prescription number, pharmacy dispenses by scanning the number, dispensing event posts back to the originating HMS for the patient record.",
        ],
      },
      {
        heading: "Edge cases hospitals miss",
        paragraphs: [
          "Wasfaty has strict rules about controlled substances, refills, and prescriptions for paediatrics. Your HMS must enforce these at prescription time, not let the pharmacy reject after the fact. Otherwise patients leave the hospital without medication.",
        ],
      },
    ],
    conclusion:
      "Wasfaty is mature but unforgiving of bad data. Pick an HMS that has been through a full year of dispensing volumes in production, not a vendor still in pilot.",
    relatedLinks: [
      { label: "Pharmacy Documentation", href: "/pharmacy-documentation" },
      { label: "KSA Compliance Documentation", href: "/ksa-documentation" },
    ],
  },
  {
    slug: "nafath-sehhaty-patient-identity",
    title: "Nafath & Sehhaty: Patient Identity in Saudi Clinics",
    description:
      "Nafath verifies patient identity; Sehhaty owns the patient health profile. Both matter for Saudi clinics. Here's how to use them.",
    keywords: ["nafath integration healthcare", "sehhaty hospital", "saudi patient identity"],
    category: "KSA Compliance",
    publishedAt: "2026-05-18",
    readingMinutes: 6,
    intro:
      "Two government services have become foundational for Saudi clinics: Nafath for identity verification and Sehhaty for the patient health profile. Hospitals that integrate both shorten registration from minutes to seconds.",
    sections: [
      {
        heading: "Nafath at registration",
        paragraphs: [
          "Nafath replaces photocopying National IDs at the registration desk. Patient enters their National ID, approves the request on the Nafath mobile app, and the HMS pulls verified demographics. Eliminates fraud, typos and duplicate records.",
        ],
      },
      {
        heading: "Sehhaty for clinical context",
        paragraphs: [
          "Sehhaty exposes the patient's vaccination history, chronic disease flags and prior visits across MOH facilities. Surfacing this in the OPD consult screen prevents duplicate tests and unsafe prescriptions.",
        ],
      },
    ],
    conclusion:
      "Nafath and Sehhaty are not optional for new Saudi hospitals. Confirm both are live in any HMS demo before committing.",
    relatedLinks: [
      { label: "KSA Compliance Documentation", href: "/ksa-documentation" },
      { label: "OPD Documentation", href: "/opd-documentation" },
    ],
  },
  {
    slug: "cbahi-accreditation-hms",
    title: "CBAHI Accreditation: How HMS Helps You Pass",
    description:
      "CBAHI accreditation audits patient safety, clinical documentation and infection control. A capable HMS turns audits from panic to paperwork.",
    keywords: ["cbahi accreditation software", "cbahi hospital", "saudi hospital accreditation"],
    category: "KSA Compliance",
    publishedAt: "2026-05-19",
    readingMinutes: 7,
    intro:
      "CBAHI (Saudi Central Board for Accreditation of Healthcare Institutions) accreditation is mandatory for licensing renewal. Hospitals that lean on their HMS for evidence pass audits faster and with fewer findings.",
    sections: [
      {
        heading: "Where HMS evidence wins points",
        paragraphs: ["CBAHI surveyors look for traceable evidence on:"],
        bullets: [
          "Medication reconciliation at admission and discharge",
          "Pain assessment at defined intervals",
          "VTE and fall-risk screening on every IPD admission",
          "Hand hygiene and infection control logs",
          "Critical lab value notification timestamps",
          "Consent forms attached to the patient record",
        ],
      },
      {
        heading: "Building the audit trail",
        paragraphs: [
          "An HMS that timestamps every action and exposes the data through standard reports lets you produce audit packs in hours, not weeks.",
        ],
      },
    ],
    conclusion:
      "Treat accreditation as a daily output of your HMS, not an annual project. The hospitals that do this never fail CBAHI surprise audits.",
    relatedLinks: [
      { label: "KSA Compliance Documentation", href: "/ksa-documentation" },
      { label: "IPD Documentation", href: "/ipd-documentation" },
    ],
  },
  {
    slug: "pharmacy-inventory-management",
    title: "Pharmacy Inventory Management: FIFO, Expiry & Reorder Levels",
    description:
      "Reduce pharmacy waste and stockouts with FIFO dispensing, expiry alerts and dynamic reorder levels. Practical rules and HMS configuration.",
    keywords: ["pharmacy inventory management", "fifo pharmacy", "pharmacy stock control"],
    category: "Pharmacy",
    publishedAt: "2026-05-20",
    readingMinutes: 8,
    intro:
      "Pharmacy inventory is the single biggest source of working-capital lockup in most hospitals. Done badly, you write off 5–10% of stock to expiry every year. Done well, you free up cash and never stock out on essentials.",
    sections: [
      {
        heading: "FIFO is non-negotiable",
        paragraphs: [
          "First In, First Out dispensing must be enforced by the system, not by pharmacist memory. The HMS should pick the oldest non-expired batch at dispensing and refuse manual overrides without an audit reason.",
        ],
      },
      {
        heading: "Expiry alerts that actually work",
        paragraphs: [
          "Alerts at 90, 60 and 30 days before expiry. Each alert routes to a specific role: 90 days to procurement (slow down reorders), 60 days to pharmacy manager (promote dispensing), 30 days to clinical (consider donation or return-to-supplier).",
        ],
      },
      {
        heading: "Dynamic reorder levels",
        paragraphs: [
          "Static reorder levels are wrong six months after you set them. The HMS should recompute reorder points monthly using rolling 90-day consumption and lead-time variance.",
        ],
      },
    ],
    conclusion:
      "Pharmacy waste is a solved problem in modern HMS platforms. If you are still writing off expired stock at scale, the issue is software, not pharmacist behaviour.",
    relatedLinks: [
      { label: "Pharmacy Documentation", href: "/pharmacy-documentation" },
      { label: "Pharmacy & Warehouse Presentation", href: "/pharmacy-warehouse-presentation" },
    ],
  },
  {
    slug: "barcode-medication-dispensing",
    title: "Reducing Medication Errors with Barcode Dispensing",
    description:
      "Barcode-verified dispensing cuts wrong-drug errors by over 80%. Learn how to roll it out across OPD pharmacy, IPD wards and operating theatre.",
    keywords: ["barcode medication dispensing", "medication safety", "bcma"],
    category: "Pharmacy",
    publishedAt: "2026-05-21",
    readingMinutes: 6,
    intro:
      "Wrong-drug and wrong-dose errors are still the #1 cause of preventable patient harm. Barcode Medication Administration (BCMA) eliminates the bulk of them at near-zero ongoing cost.",
    sections: [
      {
        heading: "The 5 rights, automated",
        paragraphs: [
          "Right patient, right drug, right dose, right route, right time. A barcode scan at dispensing and at administration verifies all five against the active prescription in the HMS.",
        ],
      },
      {
        heading: "Rollout sequence",
        paragraphs: [
          "Start with OPD pharmacy (lowest risk, highest volume), then IPD wards, then OT and ICU. Each step builds nurse and pharmacist muscle memory before tackling higher-acuity environments.",
        ],
      },
    ],
    conclusion:
      "Barcode dispensing is the highest-ROI patient safety investment in any hospital. It is also one of the easiest HMS modules to roll out in under 30 days.",
    relatedLinks: [
      { label: "Pharmacy Documentation", href: "/pharmacy-documentation" },
      { label: "IPD Documentation", href: "/ipd-documentation" },
    ],
  },
  {
    slug: "grn-to-gl-pharmacy-accounting",
    title: "GRN to GL: How Pharmacy Stock Posts to Accounting",
    description:
      "Every Goods Received Note must hit the general ledger. Here's the journal flow from PR to PO to GRN to invoice payment in a hospital HMS.",
    keywords: ["grn accounting workflow", "pharmacy gl posting", "hospital procurement accounting"],
    category: "Pharmacy",
    publishedAt: "2026-05-22",
    readingMinutes: 7,
    intro:
      "The Goods Received Note is the bridge between operations and finance. Get the GRN posting wrong and your inventory and AP balances drift apart fast.",
    sections: [
      {
        heading: "The standard journal flow",
        paragraphs: [
          "On GRN verification: DR Inventory (1010-INV), CR Accounts Payable (2010-AP) for the received value. On supplier invoice: link AP to invoice. On payment: DR AP, CR Bank (1010-BANK). On dispensing: DR Cost of Goods Sold, CR Inventory.",
        ],
      },
      {
        heading: "Why DB triggers beat app code",
        paragraphs: [
          "Manual journal posting from app code fails on race conditions and partial saves. Idempotent database triggers, keyed on the source document ID, post exactly once and survive retries.",
        ],
      },
    ],
    conclusion:
      "Insist on automated GL posting with audit trail and reconciliation reports. Any HMS that requires a finance team to journalise inventory movements manually is a 10-year-old design.",
    relatedLinks: [
      { label: "Finance Documentation", href: "/finance-documentation" },
      { label: "Warehouse Documentation", href: "/warehouse-documentation" },
    ],
  },
  {
    slug: "opd-queue-management",
    title: "OPD Token Queue Systems That Actually Reduce Wait Times",
    description:
      "Token-based OPD queues only help if displays, doctors and patients are in sync. Build a system that cuts wait time, not just one that issues numbers.",
    keywords: ["opd queue management", "patient queue system", "token display hospital"],
    category: "Clinical Workflow",
    publishedAt: "2026-05-23",
    readingMinutes: 7,
    intro:
      "Most OPD queue systems just print numbers. Real wait-time reduction comes from coordinating registration, vitals, doctor consult and pharmacy on the same token stream with public displays patients can trust.",
    sections: [
      {
        heading: "The four-station coordination",
        paragraphs: [
          "Registration issues the token. Nurse calls it for vitals. Doctor pulls it on consult. Pharmacy reuses it for dispensing. Each station updates status in real time so the lobby display shows truth, not estimates.",
        ],
      },
      {
        heading: "What to put on the public display",
        paragraphs: [
          "Current token per doctor, next 3 tokens, average wait time and any held tokens. Pagination if you have more than 12 tokens to show. Multilingual where the patient base demands it.",
        ],
      },
    ],
    conclusion:
      "OPD queue management is where patients judge your hospital. Invest the engineering hours; the return in satisfaction scores is immediate.",
    relatedLinks: [
      { label: "OPD Documentation", href: "/opd-documentation" },
      { label: "System Overview", href: "/system-overview" },
    ],
  },
  {
    slug: "ipd-discharge-checklist",
    title: "IPD Discharge Workflow: A Step-by-Step Checklist",
    description:
      "An IPD discharge involves clinical clearance, final billing, medication reconciliation and bed release. Skip a step and revenue or safety suffers.",
    keywords: ["ipd discharge process", "hospital discharge workflow", "patient discharge checklist"],
    category: "Clinical Workflow",
    publishedAt: "2026-05-24",
    readingMinutes: 8,
    intro:
      "Discharge is the most error-prone moment in an IPD stay. Charges get missed, medications get duplicated and bed turnover stalls. A disciplined HMS-driven workflow fixes all three.",
    sections: [
      {
        heading: "The discharge checklist",
        paragraphs: ["Every IPD discharge should clear these gates in order:"],
        bullets: [
          "Attending doctor clinical clearance with discharge summary",
          "All pending lab and imaging results filed",
          "Medication reconciliation against home medications",
          "All ipd_charges marked is_billed and rolled into final invoice",
          "Deposit applied, balance settled or AR created",
          "Discharge prescription written and dispensed (or Wasfaty-sent)",
          "Follow-up appointment booked",
          "Bed status updated to housekeeping",
        ],
      },
      {
        heading: "Where most hospitals leak revenue",
        paragraphs: [
          "Ward consumables, late lab orders and OT consumables added after the discharge summary often miss the invoice. Your HMS should refuse to mark the discharge complete until every off-ledger charge is on the bill.",
        ],
      },
    ],
    conclusion:
      "Discharge done right protects both revenue and patient safety. Use the HMS as the enforcement layer, not the recommendation layer.",
    relatedLinks: [
      { label: "IPD Documentation", href: "/ipd-documentation" },
      { label: "Finance Documentation", href: "/finance-documentation" },
    ],
  },
  {
    slug: "lab-turnaround-time",
    title: "Lab Order to Result: Reducing Turnaround Time",
    description:
      "Slow lab turnaround delays discharges and erodes patient trust. Map your lab lifecycle and attack the three bottlenecks that matter.",
    keywords: ["lab turnaround time", "lab workflow", "laboratory information system"],
    category: "Clinical Workflow",
    publishedAt: "2026-05-25",
    readingMinutes: 6,
    intro:
      "Lab turnaround time (TAT) is one of the most-watched KPIs in hospital operations. Lengthening TAT delays discharge, lengths of stay and bed turnover. Most of the slack is in three specific stages.",
    sections: [
      {
        heading: "The five-stage lab lifecycle",
        paragraphs: [
          "Order placed, sample collected, sample received in lab, result reported, result verified and delivered. Each stage should timestamp in the HMS so you can spot which one stalls.",
        ],
      },
      {
        heading: "The three bottlenecks",
        paragraphs: [
          "Sample collection (phlebotomist routing), sample receipt (lab accessioning) and result verification (pathologist availability). Fixing these three usually cuts TAT by 40%.",
        ],
      },
    ],
    conclusion:
      "Measure TAT per stage, per test type, per shift. Once visible, the bottlenecks fix themselves with minor process changes.",
    relatedLinks: [
      { label: "Lab Documentation", href: "/lab-documentation" },
      { label: "Documentation Hub", href: "/documentation" },
    ],
  },
  {
    slug: "radiology-reporting-workflow",
    title: "Radiology Reporting Workflows for Faster Verification",
    description:
      "Pending, reported, verified, delivered: the four states every radiology report passes through. Build the HMS workflow around them.",
    keywords: ["radiology reporting workflow", "radiology information system", "ris workflow"],
    category: "Clinical Workflow",
    publishedAt: "2026-05-26",
    readingMinutes: 6,
    intro:
      "Radiology reporting is a four-state lifecycle. Hospitals that model the lifecycle explicitly in their HMS deliver reports faster and audit them easily.",
    sections: [
      {
        heading: "The four states",
        paragraphs: [
          "Pending (study acquired, no report yet), Reported (radiologist drafted), Verified (senior radiologist signed off), Delivered (released to clinician and patient). Each transition should be timestamped and attributable.",
        ],
      },
      {
        heading: "Cutting verification delay",
        paragraphs: [
          "Verification is the most common stall point. A worklist that ranks reports by referring-doctor SLA and patient acuity (rather than chronological order) puts the right reports in front of senior radiologists first.",
        ],
      },
    ],
    conclusion:
      "Treat radiology as a queue, not a backlog. The right HMS workflow turns a 24-hour TAT into a 4-hour one with no extra staff.",
    relatedLinks: [
      { label: "Radiology Documentation", href: "/radiology-documentation" },
      { label: "Lab Documentation", href: "/lab-documentation" },
    ],
  },
  {
    slug: "hospital-revenue-cycle-management",
    title: "Hospital Revenue Cycle Management Best Practices",
    description:
      "From patient registration to final payment, RCM determines whether a hospital is profitable. Six practices that consistently move the needle.",
    keywords: ["hospital revenue cycle management", "rcm best practices", "hospital billing"],
    category: "Finance & HR",
    publishedAt: "2026-05-27",
    readingMinutes: 8,
    intro:
      "Revenue Cycle Management (RCM) is the difference between a hospital that survives and one that scales. The six practices below separate top-quartile RCM teams from the rest.",
    sections: [
      {
        heading: "The six practices",
        paragraphs: ["Apply these consistently for a quarter; cash collection improves by 15–25%."],
        bullets: [
          "Verify insurance eligibility at registration, not at billing",
          "Capture every clinical charge at the point of order, not at discharge",
          "Submit claims within 48 hours of discharge",
          "Track denials by reason code and route to a dedicated team",
          "Reconcile payments daily, never weekly",
          "Run an aged AR report every Monday and chase 90+ day balances first",
        ],
      },
      {
        heading: "Where HMS makes the difference",
        paragraphs: [
          "A modern HMS automates four of the six (eligibility, charge capture, claim submission, daily reconciliation). The other two (denial management, AR chasing) are workflow disciplines the HMS only supports.",
        ],
      },
    ],
    conclusion:
      "RCM is 70% software, 30% discipline. Get the software right first; the discipline becomes easier.",
    relatedLinks: [
      { label: "Finance Documentation", href: "/finance-documentation" },
      { label: "Finance Demo Guide", href: "/finance-demo-guide" },
    ],
  },
  {
    slug: "doctor-commission-models",
    title: "Doctor Earnings & Commission Models in Hospitals",
    description:
      "Salary, fee-share, hybrid, RVU. Compare doctor compensation models and learn how a modern HMS computes earnings automatically.",
    keywords: ["doctor commission software", "doctor earnings hospital", "physician compensation"],
    category: "Finance & HR",
    publishedAt: "2026-05-28",
    readingMinutes: 7,
    intro:
      "Doctor compensation is one of the most error-prone calculations in any hospital. Manual spreadsheets cause monthly disputes; automated HMS calculations end them.",
    sections: [
      {
        heading: "The four common models",
        paragraphs: [
          "Pure salary (predictable but no incentive), pure fee-share (incentive aligned but cash-flow risky), hybrid (base + share above threshold) and RVU-based (workload-weighted). Most modern hospitals use hybrid.",
        ],
      },
      {
        heading: "How to automate it",
        paragraphs: [
          "Set the model per doctor in the HMS. On every invoice, the system calculates doctor share against service rules and posts to a doctor-earnings ledger. At month end, payroll picks up the accrued earnings automatically.",
        ],
      },
    ],
    conclusion:
      "Automated doctor earnings remove the largest monthly source of friction between clinicians and finance. The ROI is cultural, not just financial.",
    relatedLinks: [
      { label: "HR Documentation", href: "/hr-documentation" },
      { label: "Finance Documentation", href: "/finance-documentation" },
    ],
  },
  {
    slug: "saudi-gratuity-calculation",
    title: "Saudi Labor Law: Gratuity Calculation for Healthcare Staff",
    description:
      "End-of-Service Benefit (ESB) is mandatory under Saudi labor law. Understand the formula, edge cases and how HR software automates it.",
    keywords: ["saudi gratuity calculation", "esb saudi arabia", "end of service benefit"],
    category: "Finance & HR",
    publishedAt: "2026-05-29",
    readingMinutes: 7,
    intro:
      "End-of-Service Benefit (ESB), commonly called gratuity, is a statutory entitlement for every employee in Saudi Arabia. Healthcare HR teams must calculate it correctly on every exit; mistakes attract MOL fines and labour court cases.",
    sections: [
      {
        heading: "The standard formula",
        paragraphs: [
          "Half a month's wage for each of the first five years of service, then one full month's wage for each subsequent year. Wage means last basic salary plus housing allowance, not gross.",
        ],
      },
      {
        heading: "Resignation vs termination",
        paragraphs: [
          "On resignation: 1/3 of ESB for 2–5 years of service, 2/3 for 5–10 years, full ESB after 10 years. On employer termination: full ESB regardless of tenure. Fixed-term contract completion: full ESB.",
        ],
      },
      {
        heading: "Edge cases to handle",
        paragraphs: [
          "Partial year of service is pro-rated to the day. Unpaid leave reduces accrual. Disciplinary terminations under Article 80 may forfeit ESB entirely; document the cause meticulously.",
        ],
      },
    ],
    conclusion:
      "ESB calculation is a solved problem; HR software should automate it from the salary record. Manual spreadsheet calculations are a legal risk.",
    relatedLinks: [
      { label: "HR Documentation", href: "/hr-documentation" },
      { label: "KSA Compliance Documentation", href: "/ksa-documentation" },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(slug);
  if (!current) return [];
  return posts
    .filter((p) => p.slug !== slug && p.category === current.category)
    .slice(0, limit);
}

export const categories = Array.from(new Set(posts.map((p) => p.category)));

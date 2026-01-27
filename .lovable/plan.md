
# Pricing & Commercials Document Page

## Overview
Create a new downloadable "Pricing & Commercials" proposal page similar to the existing `/presentation` page. This will be a professional multi-page document optimized for PDF export via browser print, with proper header/footer, cover page, and detailed pricing tables.

## Document Structure

### Page 1: Cover Page
- HealthOS logo and branding
- Document title: "PRICING & COMMERCIALS"
- Subtitle: "Smart Hospital Management System Proposal"
- Client placeholder: "[Hospital Name]"
- Date and version
- Contact info: smarthms.devmine.co | +971 506802430

### Page 2: Executive Summary
- Brief system overview (50 modules, 255+ features)
- Key value propositions
- Target outcomes (operational efficiency, cost savings, compliance)

### Page 3: Pricing Details
**Monthly Subscription Fee Table**
| Item | Details |
|------|---------|
| **Monthly Fee** | PKR 850,000 / Month |
| **What's Included** | |
| - Complete HealthOS System | All 50 modules |
| - AWS Cloud Hosting | Tier-1 Infrastructure |
| - System Requests | Up to 2,000,000/month |
| - Active Users | Up to 50 users |
| - Patient Profiles | Up to 500 profiles |
| - Security & Backups | Automated daily backups |
| - Monitoring | 24/7 system monitoring |
| - Technical Support | Email & phone support |
| - Maintenance | Regular updates & patches |

**One-Time Setup & Onboarding Fee Table**
| Item | Details |
|------|---------|
| **One-Time Fee** | PKR 250,000 |
| **What's Included** | |
| - System Deployment | Cloud infrastructure setup |
| - Configuration | Hospital workflow customization |
| - User & Role Setup | 25+ role configurations |
| - Training | Department-wise sessions |
| | - Doctors & Consultants |
| | - Nursing Staff |
| | - Admin & Reception |
| | - Billing & Accounts |
| - Go-Live Support | On-site and remote assistance |

### Page 4: Investment Summary
- Total Year 1 Cost breakdown
- ROI highlights
- Payment terms
- Next steps / CTA

### Page 5: Terms & Conditions (Optional)
- Contract duration
- Renewal terms
- SLA guarantees
- Data ownership

## Technical Implementation

### New Files to Create

**1. `src/pages/PricingProposal.tsx`**
Main page component with:
- Print styles (A4 portrait orientation)
- Download PDF button
- Navigation toolbar
- All slide/page components

**2. `src/components/proposal/ProposalCoverPage.tsx`**
Professional cover page with branding

**3. `src/components/proposal/ProposalExecutiveSummary.tsx`**
Executive summary with key highlights

**4. `src/components/proposal/ProposalPricingPage.tsx`**
Detailed pricing tables with:
- Monthly subscription breakdown
- One-time setup breakdown
- Clear visual hierarchy

**5. `src/components/proposal/ProposalInvestmentSummary.tsx`**
Investment summary and CTA

### Files to Modify

**1. `src/App.tsx`**
- Add route: `/pricing-proposal` -> `<PricingProposal />`

### Print Styling
```css
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm;
  }
  
  .proposal-page {
    width: 210mm;
    min-height: 297mm;
    page-break-after: always;
  }
}
```

### Design Elements
- **Header**: HealthOS logo + "Confidential Proposal"
- **Footer**: Page number + smarthms.devmine.co + Date
- **Colors**: Primary teal accent, professional gray tones
- **Tables**: Clean borders, alternating row colors
- **Typography**: Professional sans-serif, clear hierarchy

## Pricing Data Structure

```typescript
const monthlySubscription = {
  price: "PKR 850,000",
  period: "Month",
  includes: [
    { item: "Complete HealthOS System", detail: "All 50 modules" },
    { item: "AWS Cloud Hosting", detail: "Tier-1 Infrastructure" },
    { item: "System Requests", detail: "Up to 2,000,000/month" },
    { item: "Active Users", detail: "Up to 50 users" },
    { item: "Patient Profiles", detail: "Up to 500 profiles" },
    { item: "Security & Backups", detail: "Automated daily backups" },
    { item: "Monitoring", detail: "24/7 system monitoring" },
    { item: "Technical Support", detail: "Email & phone support" },
    { item: "Maintenance", detail: "Regular updates & patches" },
  ]
};

const setupFee = {
  price: "PKR 250,000",
  type: "One-Time",
  includes: [
    { item: "System Deployment", detail: "Cloud infrastructure setup" },
    { item: "Configuration", detail: "Hospital workflow customization" },
    { item: "User & Role Setup", detail: "25+ role configurations" },
    { item: "Department Training", details: [
      "Doctors & Consultants",
      "Nursing Staff", 
      "Admin & Reception",
      "Billing & Accounts"
    ]},
    { item: "Go-Live Support", detail: "On-site and remote assistance" },
  ]
};
```

## Access
- URL: `/pricing-proposal`
- Publicly accessible (no auth required)
- Linked from landing page (optional) or shared via direct link

## Summary

| Component | Purpose |
|-----------|---------|
| `PricingProposal.tsx` | Main page with print controls |
| `ProposalCoverPage.tsx` | Professional cover page |
| `ProposalExecutiveSummary.tsx` | System overview |
| `ProposalPricingPage.tsx` | Detailed pricing tables |
| `ProposalInvestmentSummary.tsx` | Total cost & CTA |

This creates a professional, downloadable pricing proposal document that matches the quality of the existing presentation deck and can be sent directly to hospital decision-makers.



# Legal Contract Page — HealthOS 24 × Capital Care International Hospital

## Overview
Create a new printable/downloadable legal contract page following the same proposal page architecture. The contract will be a multi-page document covering the SaaS agreement between **HealthOS 24** (provider) and **Capital Care International Hospital** (client) at **PKR 315,000/month** with **PKR 50,000/new OPD** expansion pricing.

## New Files

### 1. `src/components/contract/ContractPage.tsx`
A comprehensive legal contract with the following sections rendered as styled pages (same `proposal-page` pattern):

**Page 1 — Cover**: "Service Agreement" title, both party names, date, confidential marking.

**Page 2 — Parties & Recitals**: Full legal identification of both parties, whereas clauses.

**Page 3 — Scope of Services**: Complete HealthOS 24 system (all 50 modules), cloud hosting, support, maintenance — referencing the proposal.

**Page 4 — Commercial Terms**:
- Monthly subscription: **PKR 315,000/month**
- Includes: all current modules, up to 50 users, up to 500 patient profiles, AWS hosting, backups, support
- Future expansion: **PKR 50,000 per new OPD** added
- Payment due within 7 days of invoice
- Late payment penalties

**Page 5 — Term & Termination**:
- 12-month initial term, auto-renewal
- 90-day notice for non-renewal
- Termination for cause clauses
- Data handover obligations

**Page 6 — SLA & Support**:
- 99.9% uptime guarantee
- Response times (critical: 1hr, standard: 4hrs)
- Maintenance windows

**Page 7 — Data, Security & Confidentiality**:
- Data ownership (hospital owns all data)
- Encryption standards
- Confidentiality obligations
- HIPAA-aligned practices

**Page 8 — General Clauses**:
- Force majeure, governing law (Pakistan), dispute resolution, amendments, entire agreement, severability

**Page 9 — Signature Block**:
- Two columns: HealthOS 24 representative + Hospital representative
- Name, title, date, signature lines

### 2. `src/pages/ContractPage.tsx`
Route page with PDF download capability (same pattern as `PricingProposal.tsx`), rendering all contract sections with page navigation and export.

### 3. Route Registration in `src/App.tsx`
Add `/contract` route.

## Styling
- Reuse `proposal-page` CSS class and the same header/footer pattern
- Professional legal document typography — smaller text, justified, numbered clauses
- HealthOS24Logo in headers

## Key Contract Values
| Item | Value |
|------|-------|
| Provider | HealthOS 24 |
| Client | Capital Care International Hospital |
| Monthly Fee | PKR 315,000 |
| New OPD Expansion | PKR 50,000 per OPD |
| Contract Term | 12 months, auto-renew |
| Notice Period | 90 days |


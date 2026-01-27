
# Remove Investment Summary & Fix Table Printing

## Summary
Remove the "Investment Summary" page from the proposal and fix the issue where tables are splitting across pages during PDF download.

## Changes Required

### 1. Remove Investment Summary Page

**File: `src/pages/PricingProposal.tsx`**
- Remove the import for `ProposalInvestmentSummary`
- Remove the "investment" entry from the `pages` array
- Document will go from 5 pages to 4 pages

### 2. Update Page Numbers

All remaining pages need updated page number badges:

| Page | Current | New |
|------|---------|-----|
| Cover Page | 01 / 05 | 01 / 04 |
| Executive Summary | 02 / 05 | 02 / 04 |
| Pricing Details | 03 / 05 | 03 / 04 |
| Terms & Conditions | 05 / 05 | 04 / 04 |

**Files to update:**
- `ProposalCoverPage.tsx` - Change to "01 / 04"
- `ProposalExecutiveSummary.tsx` - Change to "02 / 04"
- `ProposalPricingPage.tsx` - Change to "03 / 04"
- `ProposalTermsPage.tsx` - Change to "04 / 04"

### 3. Fix Table Splitting During PDF Download

**File: `src/pages/PricingProposal.tsx`**

Add CSS rules in the print styles to prevent tables from breaking across pages:

```css
@media print {
  /* Existing styles... */
  
  /* Prevent table rows from splitting */
  table {
    page-break-inside: auto;
  }
  
  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
  
  thead {
    display: table-header-group;
  }
  
  tfoot {
    display: table-footer-group;
  }
  
  /* Keep table sections together */
  .table-container,
  [class*="rounded-xl"] {
    page-break-inside: avoid;
  }
  
  /* Keep pricing cards together */
  .bg-primary,
  .bg-blue-600 {
    page-break-inside: avoid;
    page-break-after: avoid;
  }
}
```

### 4. Update Footer Text

All pages currently show "HealthOS - Pricing & Commercials" in the footer. This should be updated to "HealthOS Proposal" to match the new branding.

**Files to update:**
- `ProposalExecutiveSummary.tsx`
- `ProposalPricingPage.tsx`
- `ProposalTermsPage.tsx`

## Files Summary

| File | Action | Changes |
|------|--------|---------|
| `PricingProposal.tsx` | Modify | Remove investment import, update pages array, add table print styles |
| `ProposalCoverPage.tsx` | Modify | Update page number to "01 / 04" |
| `ProposalExecutiveSummary.tsx` | Modify | Update page number to "02 / 04", update footer |
| `ProposalPricingPage.tsx` | Modify | Update page number to "03 / 04", update footer |
| `ProposalTermsPage.tsx` | Modify | Update page number to "04 / 04", update footer |
| `ProposalInvestmentSummary.tsx` | Delete | No longer needed |

## Result
- 4-page proposal document (Cover, Summary, Pricing, Terms)
- Tables will stay intact on single pages during PDF download
- Consistent page numbering and footer branding

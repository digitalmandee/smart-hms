
# HealthOS 24 Complete Rebranding Plan

## Overview

This plan updates **all branding** across the entire codebase from "HealthOS" to "HealthOS 24" with the new domain **healthos24.com**. The logo will feature "24" prominently in the icon area, representing 24/7 availability for this multi-tenant SaaS hospital management platform.

---

## Brand Identity Changes

| Element | Old | New |
|---------|-----|-----|
| **Product Name** | HealthOS | HealthOS 24 |
| **Domain** | smarthms.devmine.co | healthos24.com |
| **Support Email** | support@healthos.ae | support@healthos24.com |
| **Contact Email** | hello@healthos.ae | hello@healthos24.com |
| **Sales Email** | sales@devmine.co | sales@healthos24.com |
| **Company Name** | Devmine | HealthOS 24 |
| **Verification URLs** | smart-hms.lovable.app | healthos24.com |
| **Logo Icon** | Activity icon | Custom "24" badge |

---

## Logo Design Concept

The new logo features "24" prominently within the icon, with "HealthOS" as the text label:

```text
┌─────────────────────────────────────────┐
│                                         │
│   ┌─────────────┐                       │
│   │     24      │  HealthOS             │
│   │   ──────    │  Smart Hospital       │
│   │   ♥  ─ ─    │  Management           │
│   └─────────────┘                       │
│                                         │
│   Icon shows "24" with heartbeat line   │
│   below, symbolizing 24/7 healthcare    │
│                                         │
└─────────────────────────────────────────┘
```

**Icon Variations:**
- **Large**: "24" with heartbeat line and gradient background
- **Collapsed Sidebar**: Just "24" badge
- **Favicon**: "24" in primary color

---

## Files to Update

### 1. Core HTML & SEO (1 file)

**`index.html`**
- Update `<title>` to "HealthOS 24 - 24/7 Smart Hospital Management"
- Update meta descriptions to include "24/7 availability"
- Update Open Graph and Twitter card metadata
- Reference new favicon

### 2. Create Unified Logo Component (1 new file)

**`src/components/brand/HealthOS24Logo.tsx`**

A reusable logo component with variants:
- `full` - Icon + "HealthOS" text
- `icon` - Just the 24 badge icon
- `minimal` - Small icon for tight spaces

The icon will be a custom SVG showing "24" with a subtle heartbeat line.

### 3. Landing Page Components (8 files)

| File | Changes |
|------|---------|
| `src/components/landing/Navbar.tsx` | Replace Activity icon with HealthOS24Logo, update text |
| `src/components/landing/Footer.tsx` | Update logo, emails, copyright to "HealthOS 24" |
| `src/components/landing/CTASection.tsx` | Update email addresses |
| `src/components/landing/HeroSection.tsx` | Update any brand references |
| `src/components/landing/ComparisonTable.tsx` | Replace "HealthOS" with "HealthOS 24" |
| `src/components/landing/TrustBadges.tsx` | Update if brand mentioned |
| `src/components/landing/TestimonialsSection.tsx` | Update brand references |
| `src/components/landing/FAQSection.tsx` | Update brand mentions |

### 4. Sidebar/App Chrome (1 file)

**`src/components/DynamicSidebar.tsx`**
- Replace Heart icon with HealthOS24Logo component
- Update text from "HealthOS" to "HealthOS 24"

### 5. Presentation Slides (10 files)

| File | Changes |
|------|---------|
| `TitleSlide.tsx` | Logo, brand name, domain to healthos24.com |
| `FeaturesOverviewSlide.tsx` | Header logo, footer domain |
| `ModuleSlide.tsx` | Footer branding |
| `IntegrationSlide.tsx` | Footer branding |
| `WorkflowSlide.tsx` | Footer branding |
| `TimelineSlide.tsx` | Footer branding |
| `OTDashboardSlide.tsx` | Footer branding |
| `ProcurementSlide.tsx` | Footer branding |
| `CTASlide.tsx` | Contact info, website, email |
| `ScreenshotSlide.tsx` | Any brand references |

### 6. Proposal Documents (9 files)

| File | Changes |
|------|---------|
| `ProposalCoverPage.tsx` | Full rebrand: logo, name, domain, company |
| `ProposalExecutiveSummary.tsx` | Header logo, footer |
| `ProposalClinicalFeatures.tsx` | Header and footer |
| `ProposalDiagnosticsFeatures.tsx` | Header and footer |
| `ProposalPharmacyFeatures.tsx` | Header and footer |
| `ProposalFinanceFeatures.tsx` | Header and footer |
| `ProposalOperationsFeatures.tsx` | Header and footer |
| `ProposalTechnicalSpecs.tsx` | Header and footer |
| `ProposalTermsPage.tsx` | Header and footer |
| `ProposalPricingPage.tsx` | Header and footer |

### 7. Verification URLs & QR Codes (2 files)

**`src/lib/qrcode.ts`**
- Update base URL from `smart-hms.lovable.app` to `healthos24.com`

**`src/components/lab/PrintableLabReport.tsx`**
- Update verification URL to use healthos24.com

### 8. Public Assets (3 files)

| File | Action |
|------|--------|
| `public/favicon.png` | Generate new "24" favicon |
| `public/favicon.ico` | Generate new "24" favicon |
| `public/og-image.png` | Create new OG image with HealthOS 24 branding |

---

## Technical Implementation

### HealthOS24Logo Component Structure

```typescript
interface HealthOS24LogoProps {
  variant?: 'full' | 'icon' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

// The icon SVG features:
// - "24" text prominently displayed
// - Subtle heartbeat/pulse line below
// - Gradient background (primary color)
// - Rounded corners
```

### Icon SVG Concept

```svg
<!-- 24 Badge with heartbeat -->
<svg viewBox="0 0 40 40">
  <rect rx="8" fill="url(#gradient)" />
  <text x="20" y="22" text-anchor="middle" 
        font-weight="bold" fill="white">24</text>
  <path d="M8 28 L14 28 L17 24 L20 32 L23 26 L26 28 L32 28" 
        stroke="white" stroke-width="1.5" fill="none"/>
</svg>
```

---

## Search & Replace Summary

| Find | Replace With |
|------|--------------|
| `HealthOS` (standalone) | `HealthOS 24` |
| `smarthms.devmine.co` | `healthos24.com` |
| `smart-hms.lovable.app` | `healthos24.com` |
| `support@healthos.ae` | `support@healthos24.com` |
| `hello@healthos.ae` | `hello@healthos24.com` |
| `sales@devmine.co` | `sales@healthos24.com` |
| `Devmine` (company) | `HealthOS 24` |
| Activity icon imports | HealthOS24Logo component |

---

## Files Summary

| Category | File Count |
|----------|------------|
| New Components | 1 |
| HTML/SEO | 1 |
| Landing Pages | 8 |
| App Chrome | 1 |
| Presentation | 10 |
| Proposal | 10 |
| Utilities | 2 |
| Assets | 3 |
| **Total** | **~36 files** |

---

## Multi-Tenant SaaS Considerations

Since this is a SaaS product onboarding multiple hospitals:

1. **Unified Branding**: All files use the centralized `HealthOS24Logo` component
2. **Easy Updates**: Future brand changes only require updating one component
3. **White-Label Ready**: The existing `useOrganizationBranding` hook remains for per-hospital customization
4. **Verification URLs**: Updated to use the production domain for QR codes on printed documents

---

## Post-Implementation

After code changes, you'll need to:
1. **Set up DNS** for healthos24.com pointing to Lovable
2. **Configure custom domain** in Lovable project settings
3. **Create email addresses** (support@, hello@, sales@healthos24.com)
4. **Upload final favicon/OG images** if you have designed assets


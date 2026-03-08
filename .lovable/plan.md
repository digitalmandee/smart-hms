

# Add KSA Compliance Section to Landing Page

## What We're Building

A new landing page section showcasing KSA compliance integrations, placed between the existing `WarehouseSection` and `RoleSelector`. It highlights all 7 Saudi regulatory integrations with a "Download Full Guide" link to `/ksa-documentation`.

## New File

**`src/components/landing/KsaComplianceSection.tsx`**

A visually distinct section with Saudi green/gold theming containing:
- Section header: "Built for Saudi Arabia" with a 🇸🇦 badge
- 7 integration cards in a responsive grid (NPHIES, ZATCA, Wasfaty, Tatmeen, HESN, Nafath, Sehhaty) — each with icon, name, and one-line description
- A "Download Full Compliance Guide (PDF)" button linking to `/ksa-documentation`
- Wrapped in `AnimatedSection` for consistency

## Modified Files

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Import and add `<KsaComplianceSection />` after `WarehouseSection` |
| `src/components/landing/Footer.tsx` | Add "KSA Compliance Guide" link to Resources section pointing to `/ksa-documentation` |


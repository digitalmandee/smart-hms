

# Redesign GRN & PO Printable Templates — Professional Invoice Style with Hospital Branding

## Problems (from screenshot)
1. **No hospital branding** — no logo, no address, no contact info in header
2. **Item name is blank** — shows nothing for medicine items (only `item.item?.name`, no medicine fallback)
3. **Poor layout** — plain text dump, no borders on table, no visual hierarchy, looks like raw data not an invoice
4. **No currency formatting** — shows "Rs. 0" with no proper formatting
5. **Tailwind classes don't work in print window** — the `usePrint` hook opens a new window with raw HTML, Tailwind utility classes like `grid-cols-2`, `text-right`, `border-b` are NOT available in print, so everything collapses to plain unstyled text

## Root Cause
`PrintableGRN` uses Tailwind classes but the print window opened by `usePrint` has NO Tailwind CSS loaded. The component renders correctly in-page but when its `innerHTML` is extracted into a new window, all styling is lost.

## Solution
Rewrite `PrintableGRN` and `PrintablePO` to use **inline styles** instead of Tailwind classes, include full hospital branding (logo, name, address, phone, email, registration number), and display medicine names properly. Design them like professional hospital invoices with:
- Branded header with logo + org details
- Bordered table with alternating row shading
- Proper totals section aligned right
- Signature blocks at bottom
- Footer with org contact info

## Changes

### 1. `src/components/inventory/PrintableGRN.tsx` — Full rewrite
- Accept `branding: OrganizationBranding` prop instead of just `organizationName`
- Use inline styles throughout (no Tailwind)
- Professional invoice layout:
  - Header: Logo (if available) + Organization name, address, phone, email, reg number
  - Document title: "GOODS RECEIVED NOTE" with colored accent bar
  - Two-column info section: GRN details (left) + Vendor details (right)
  - Bordered table with header background color, proper column widths
  - Item name: `item.item?.name || item.medicine?.name || 'Unknown Item'`
  - Totals section right-aligned in a box
  - Notes section
  - 3 signature blocks
  - Footer: "This is a computer-generated document"

### 2. `src/components/inventory/PrintablePO.tsx` — Same treatment
- Accept `branding` prop
- Inline styles, professional invoice look
- Medicine name fallback already exists, keep it

### 3. `src/pages/app/inventory/GRNDetailPage.tsx` — Pass branding
- Import `useOrganizationBranding`
- Pass `branding` to `PrintableGRN` instead of just `organizationName`

### 4. Update any PO detail page that uses `PrintablePO` — Pass branding similarly

## Technical Details
- All styles will be inline (`style={{ ... }}`) so they survive the `usePrint` innerHTML extraction
- Logo rendered as `<img>` tag with the `branding.logo_url` if available
- Primary color from `branding.primary_color` used for accent bars and table headers
- Currency formatted via the `fc` helper already in the component, using `useCurrencyFormatter` pattern


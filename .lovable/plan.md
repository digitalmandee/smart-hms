## Rebrand the Pharmacy + Warehouse PDF deck to match the main HealthOS 24 presentation

The current `HealthOS24_Pharmacy_Warehouse_Deck.pdf` was generated with an ad-hoc teal/indigo/orange palette and Work Sans typography. The main in-app deck (`/presentation`, linked from the home page) uses a specific brand system that this PDF must mirror exactly.

### Brand system to mirror (extracted from `src/index.css` + `src/components/presentation/*`)

**Color tokens (from `:root` in `index.css`):**
- Primary (Healthcare Teal): `#0D9488` (hsl 174 84% 32%)
- Primary tint backgrounds: `#0D9488` @ 10% opacity → `#E6F4F2`
- Accent (Coral): `#E8674E` (hsl 16 85% 57%)
- Background: `#F1F4F8` (hsl 210 25% 96%)
- Card: `#FFFFFF`
- Foreground text: `#1E293B` (hsl 220 25% 15%)
- Muted text: `#64748B` (hsl 220 10% 45%)
- Border: `#E2E8F0` (hsl 214 32% 91%)
- Sidebar/Dark teal: `#125E55` (hsl 174 84% 22%) — used for hero footer band
- Step pill colors used in `ProcurementSlide.tsx`: blue `#3B82F6`, violet `#8B5CF6`, orange `#F97316`, emerald `#10B981`, rose `#F43F5E`, teal `#14B8A6`
- Sub-store colors used in `WarehouseSlide.tsx`: blue/green/orange/purple

**Typography:** Inter (Google Fonts, weights 400/500/600/700) — matches the in-app deck.

**Layout conventions per slide:**
1. Top header band: small category chip (e.g. "Pharmacy" / "Supply Chain") in primary-tint pill, then large bold title (~28pt), with slide counter "N / 24" right-aligned, separated by a 1px border.
2. Subtitle paragraph in muted color.
3. Body grid (1- or 2-column) with white rounded cards (radius 12), subtle border `#E2E8F0`, soft shadow.
4. Bottom stats row: 3 KPI tiles, primary-color numbers, muted labels.
5. Footer: thin border-top, left "HealthOS 24 - AI-Powered Hospital Management System", right "healthos24.com".
6. Title slide: gradient background (primary @ 10% → background → primary @ 5%), centered "24" badge logo (rounded square, teal gradient, white "24" + heartbeat line, drawn as vector), big two-line title with the second line in primary color, feature pills, stats card.

### Implementation

1. Rewrite `/tmp/build_deck.py` (reportlab) using the exact tokens above. Replace the current Work Sans + indigo/orange theme with Inter + teal/coral.
2. Re-draw the "24" heartbeat logo as native reportlab vector (rounded rect with linear gradient, white "24" text, polyline heartbeat) so the title slide matches `HealthOS24Logo` pixel-for-pixel in spirit.
3. Apply consistent header/footer template to all 20 pages.
4. Recolor all process-step icons (Procurement: blue→violet→orange→emerald→rose→teal) and warehouse sub-store tiles (blue/green/orange/purple) to match the React slides.
5. Keep all existing content (20 pages, same structure: Title, Architecture, 6× Pharmacy, 6× Warehouse, Procurement cycle, Compliance, GL mapping, Roadmap, CTA).
6. Output to `/mnt/documents/HealthOS24_Pharmacy_Warehouse_Deck_v2.pdf` (versioned per artifact-iteration rule).
7. QA: rasterize all 20 pages with `pdftoppm` and visually inspect each one for color match, spacing, no clipping, no font fallback boxes. Iterate fixes until clean. Discard QA images after.

### Files & deliverable

- Script: `/tmp/build_deck.py` (rewrite)
- Output artifact: `/mnt/documents/HealthOS24_Pharmacy_Warehouse_Deck_v2.pdf`
- No project source files change.
- The user receives the new PDF via a `<lov-artifact>` tag.

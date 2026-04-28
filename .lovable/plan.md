# Pharmacy & Warehouse Module — Presentation PDF

## Output
A single downloadable PDF deck (`/mnt/documents/HealthOS24_Pharmacy_Warehouse_Deck.pdf`), 16:9 landscape, ~20 pages, English. Built with `reportlab` using the HealthOS 24 brand palette (deep teal + indigo accents, charcoal text, off-white background) consistent with existing `Proposal*` components.

## Deck Structure (20 pages)

```text
01  Cover                — HealthOS 24 · Pharmacy & Warehouse Module
02  Agenda / What's inside
03  Module Overview      — two pillars: Pharmacy + Warehouse/WMS
04  Architecture Map     — PR → PO → GRN → Put-Away → Pick → Dispense → POS → GL

PHARMACY (6 pages)
05  Pharmacy Dashboard & KPIs
06  Medicine Catalog & Categories  (batch, expiry, rack, alternatives)
07  Stock Entry & GRN Intake       (FIFO/FEFO, atomic upsert)
08  Prescription Queue & Dispensing (OPD/IPD/OT, Wasfaty KSA)
09  POS Terminal & Sessions        (cart, held txns, refunds, receipts)
10  Returns, Stock Movements, Alerts (low-stock, expiry, reorder)

WAREHOUSE / WMS (6 pages)
11  Warehouse Dashboard & Executive KPIs
12  Stores, Zones, Bins/Racks      (storage map, capacity)
13  Procurement: PR → PO → GRN     (3-way match, vendor mgmt)
14  Put-Away & Picking             (worklist, pick lists, packing slips)
15  Transfers, RTV, Cycle Count    (multi-store, variance posting)
16  Shipping, Dock & Gate Log      (inbound/outbound logistics)

CROSS-CUTTING (3 pages)
17  Reports & Analytics            (consumption, ABC, expiry, P&L)
18  Compliance & Integrations      (Wasfaty, Tatmeen, ZATCA, NPHIES)
19  GL Integration                 (auto-post DR/CR map for POS, GRN, RTV)
20  Closing — value summary + contact
```

## Visual Design
- **Palette**: Primary `#0F4C5C` (deep teal), Accent `#5F6CAF` (indigo), Highlight `#E36414` (warm orange for KPI numbers), Surface `#F8F7F2` (warm off-white), Text `#1F2937`.
- **Layout per page**: Left accent bar (8pt teal), small page number top-right, large title, subtitle, then a 2-column or icon-grid body. Footer: "HealthOS 24 · Pharmacy & Warehouse" left, "healthos24.com" right.
- **Diagrams**: Page 04 (architecture flow) and page 19 (GL T-account) drawn with reportlab primitives (rounded rects, arrows). No emojis.
- **Typography**: Helvetica-Bold titles (28pt), Helvetica subtitle (14pt teal), Helvetica body (11pt), small caps section labels.
- **No screenshots** — reportlab cannot capture the running app reliably, and stylized diagrams + feature grids look more polished in print.

## Content Source
Page content is derived from actual modules verified in the repo:
- Pharmacy: 26 pages under `src/pages/app/pharmacy/` (Dashboard, MedicinesList, StockEntry, PrescriptionQueue, Dispensing, POSTerminal, POSSessions, Returns, StockAlerts, StockMovements, RackManagement, Reports, Settings, plus Wasfaty/Tatmeen panels in `src/components/pharmacy/`).
- Warehouse: 50+ pages under `src/pages/app/inventory/` (PR/PO/GRN, PutAway, PickLists, PackingSlips, Transfers, RTV, CycleCount, StockAdjustments, Vendors, Stores, Zones/Bins, ReorderAlerts, KPI Dashboard, Integrations, Shipping, GateLog, DockSchedule).
- Compliance/GL drawn from existing memories (Wasfaty KSA, Tatmeen, COGS auto-post, GRN trigger, ZATCA).

## Implementation Steps
1. Write a single Python script `/tmp/build_deck.py` using reportlab `canvas` with a 16:9 page size (13.333" × 7.5").
2. Define brand helpers (`draw_header`, `draw_footer`, `draw_kpi`, `draw_feature_grid`, `draw_flow_diagram`).
3. Generate each of the 20 pages.
4. Output to `/mnt/documents/HealthOS24_Pharmacy_Warehouse_Deck.pdf`.
5. **QA**: convert each page with `pdftoppm -jpeg -r 120` and visually inspect every page for overflow, overlap, contrast, and alignment. Iterate until clean. QA images discarded.
6. Emit `<lov-artifact>` tag.

## Files Touched
- None in the repo. Only generates the deliverable PDF in `/mnt/documents/`.

## Note on Trilingual Rule
The project memory says to build features in EN/AR/UR. That rule applies to in-app UI. This is a one-shot **English sales/overview PDF artifact** (per your format choice). If you'd like Arabic and Urdu PDF editions afterward, I can generate those as `_AR.pdf` and `_UR.pdf` in a follow-up — just say the word.

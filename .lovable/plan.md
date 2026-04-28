## Goal

Replace the standalone PDF approach with a **real in-app presentation route** at `/pharmacy-warehouse-presentation`, mirroring the existing `/presentation` page (same toolbar, slide shell, Print + Download PDF buttons, html-to-image + jsPDF capture pipeline). This guarantees consistent fonts (Inter from the app's CSS), consistent branding, and a shareable link — exactly like the main deck.

The current PDF (`HealthOS24_Pharmacy_Warehouse_Deck_v2.pdf`) is built outside the app via reportlab, which is why fonts look off and the pharmacy process is shallow. Building it as React slides fixes both at once.

## Deliverables

1. **New route**: `/pharmacy-warehouse-presentation` (also opens in a new tab from the navbar, like `/presentation`).
2. **Navbar link** added next to the existing "Presentation" button: a second outline button labelled "Pharmacy & Warehouse" (FileDown icon). Mobile menu gets the same entry.
3. **PDF download** uses the same `html-to-image` → `jsPDF` flow already proven in `Presentation.tsx`, so the downloaded file inherits Inter font rendering, brand colors, and slide layout perfectly.
4. **i18n**: All slide text wrapped via the existing translation system so EN / UR / AR all render correctly (per project rule). Arabic/Urdu blocks use the existing RTL utilities.

## Slide Deck Structure (22 slides)

Pharmacy is given the depth it was missing — full lifecycle, not just a list.

**Section A — Cover & Context (1–3)**
1. Title slide — "Pharmacy & Warehouse Suite" with HealthOS 24 logo badge
2. Why these modules matter — KPIs (stock-outs, expiry loss, GRN cycle time)
3. Module map — Pharmacy + Warehouse + their shared procurement spine

**Section B — Pharmacy, explained step-by-step (4–12)**
4. Master Data Setup — Medicine catalog, generics, forms, schedule, barcodes, tax slabs
5. Suppliers & Price Lists — vendor onboarding, MoQ, lead times, price agreements
6. Procurement: PR → PO → GRN — 3-way match diagram with statuses
7. GRN Posting & Stock Intake — atomic upsert into `medicine_inventory` (FEFO/FIFO, batch, expiry, cost), AP-001 / INV-001 journal auto-post
8. Storage & Stores — multiple stores, transfers with in-transit ledger, reorder thresholds
9. Dispensing channels — OPD prescription, IPD ward issue, Walk-in POS, Wasfaty (KSA) — one diagram, four lanes
10. POS Sale Lifecycle — session open → cart → split tender → ZATCA invoice → COGS posting (EXP-COGS-001 / INV-001)
11. Returns, Wastage & Expiry control — partial returns, near-expiry alerts, write-off journal
12. Pharmacy Reporting — gross margin, fast/slow movers, stock valuation, doctor-wise prescribing

**Section C — Warehouse / WMS (13–18)**
13. Warehouse architecture — Zones → Aisles → Racks → Bins (visual hierarchy)
14. Inbound flow — gate-in, GRN verification, putaway suggestions
15. Internal movements — bin-to-bin, store-to-store, in-transit accounting
16. Outbound flow — picking lists, packing, gate-out, requisition fulfillment
17. Cycle counts & adjustments — variance approval, GL impact
18. WMS dashboards — occupancy heatmap, ageing, dead stock

**Section D — Compliance, Integrations, Close (19–22)**
19. KSA Compliance — Wasfaty, Tatmeen/RSD, ZATCA Phase-2 e-invoicing (with QR sample)
20. Finance Integration — trigger map (`post_grn_to_journal`, `pharmacy_pos_post`, transfer triggers)
21. Connected Modules — orbit diagram (OPD, IPD, OT, Lab, Finance, HR)
22. CTA — "See it live" with link back to `/auth/signup`

## Technical Notes

- New file `src/pages/PharmacyWarehousePresentation.tsx` cloned from `Presentation.tsx`'s shell (toolbar, print CSS, capture loop, download handler). Title and `TOTAL_SLIDES` constant updated.
- New folder `src/components/presentation/pharmacy-warehouse/` containing the 22 slide components. Each slide reuses existing tokens (`text-primary`, `bg-card`, brand teal/coral) — no inline color hex codes — so PDF capture inherits the same Inter font tree as the main deck.
- The deep pharmacy diagrams (slides 6, 7, 9, 10) built with plain Tailwind + lucide icons (Pill, Truck, Receipt, QrCode, Boxes, ArrowRight) — same vocabulary as `ProcurementSlide.tsx` and `WarehouseSlide.tsx`.
- Add route in `src/App.tsx`:
  ```tsx
  import PharmacyWarehousePresentation from "./pages/PharmacyWarehousePresentation";
  <Route path="/pharmacy-warehouse-presentation" element={<PharmacyWarehousePresentation />} />
  ```
- Add navbar link in `src/components/landing/Navbar.tsx` (desktop block around line 65 and mobile block) — second outline `Button` opening `/pharmacy-warehouse-presentation` in a new tab.
- Trilingual content uses the existing translation hook pattern already in landing components.
- The old `/mnt/documents/HealthOS24_Pharmacy_Warehouse_Deck_v2.pdf` is left in place; users can now generate a fresh, properly-fonted PDF directly from the new route via the "Download PDF" button.

## Out of Scope

- Re-running the reportlab script (the PDF route inside the app supersedes it).
- Changes to the existing `/presentation` deck.

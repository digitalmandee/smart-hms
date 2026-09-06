# Dental Workspace: Reference-Grade Odontogram + Full Clinical Flows

The reference screenshot is a single patient-centred dental workspace: one patient header, one row of clinical tabs, and an anatomically drawn odontogram with per-surface boxes and a right-hand charting panel. Today the dental section is a set of separate pages (chart, treatments, plans, procedures, images, reports) with a patient dropdown on each, coloured surface squares instead of tooth drawings, and no findings catalogue.

This plan rebuilds it to match the reference and fills in the missing dental specialities.

## 1. Patient workspace shell

- New route `/app/dental/workspace/:patientId` — patient name, file number, and breadcrumb (Dental > Workspace > SMC-0003) at the top, then one tab bar for every dental flow. Patient is chosen once, never re-picked per page.
- Tab bar (two rows, wrapping): Odontogram, Treatment Plan, Consent, Periodontal, Oral Medicine, Endodontics, Oral Surgery, Implantology, Orthodontics, Aligners, Ceph, Pediatric, Prosthodontics, Chairside, Lab, Post-op, Billing, Scans, CBCT.
- The dental patient list becomes the entry point: search by name / phone / file number, click through to the workspace. Existing standalone pages stay reachable but redirect into the workspace tabs.

## 2. Odontogram redesigned to the reference

- **Anatomical tooth drawings** (SVG) per tooth class — incisor, canine, premolar, molar — upper arch crowns pointing up, lower arch pointing down, with an "OCCLUSAL PLANE" divider and a midline.
- **Per-surface boxes** below each upper tooth and above each lower tooth: the classic 5-box grid labelled by real surface names per tooth (B/F, M, O/I, D, P/L) so anterior teeth read F/I/P and posteriors B/O/L. Each box is individually clickable and colours to its charted finding.
- **Toolbar** exactly as referenced: Chart / 3D toggle, dentition select (Permanent / Primary / Mixed), notation select (FDI ISO 3950 / Universal / Palmer), History switch with a date scrubber, keyboard-shortcut helper, Snapshot (saves a chart image to the patient record).
- **Interaction**: click a tooth to select, click a surface box to chart that surface, shift-click for multi-tooth charting; a tooth can hold several simultaneous findings, and closing one keeps it visible in history.
- Selected teeth/surfaces highlight; hover shows tooth number and current findings.

## 3. Charting panel (right side)

- Header shows the selected tooth (or "Select a tooth"), surface chips M / D / F(B) / P(L) / I(O) that toggle the target surfaces.
- **Finding search** over a catalogue with CDT codes, plus a Favourites row (Caries, Composite restoration, Amalgam restoration, Crown, Root canal treatment, Missing tooth) and an expandable "All findings" list grouped by category.
- **Status** select (Finding / Planned / In progress / Completed / Existing / Watch) and a Notes box.
- **Chart button** writes the finding; a Repeat action re-applies the last finding to the next tooth.
- Findings carry the CDT code through to treatment planning and billing.

## 4. 3D view

The existing 3D arch stays behind the Chart/3D toggle, upgraded to share the same finding colours and surface mapping so switching views shows identical state.

## 5. Clinical flow tabs

Each tab is a real, saving workspace section, seeded from charted findings where relevant:

- **Treatment Plan** — phased plan built from findings, per-item CDT code, cost, tooth/surface, acceptance status, patient signature, print/estimate.
- **Consent** — procedure-specific consent templates, patient signature capture, PDF into the patient record.
- **Periodontal** — 6-site pocket depths, recession, bleeding, mobility, furcation, plaque/bleeding indices, and a perio chart printout.
- **Endodontics** — canal count, working lengths, apex readings, obturation, per-visit RCT progress.
- **Oral Surgery** — extraction/surgical notes, anaesthesia, complications, post-op instructions.
- **Implantology** — implant brand/size/torque per site, stage tracking (placement, healing, abutment, crown).
- **Orthodontics / Aligners / Ceph** — appliance and bracket records, adjustment visit log, aligner tray schedule with compliance, cephalometric measurements.
- **Prosthodontics** — crown/bridge/denture records, shade, lab shipping status.
- **Oral Medicine** — soft-tissue exam, lesion map, mucosal findings, biopsy tracking.
- **Pediatric** — primary-dentition charting, fluoride/sealant history, eruption chart, behaviour notes.
- **Chairside** — today's visit: vitals, anaesthesia, procedures performed, materials/consumables used, chair time.
- **Lab** — lab work orders (impression sent, due date, received, fitted) linked to prosthodontics.
- **Post-op** — instructions issued, follow-up calls, complication log.
- **Billing** — dental charges from completed items straight into the existing invoice flow (no accounting changes).
- **Scans / CBCT** — image library per tooth: intraoral, periapical, panoramic, CBCT series, before/after compare.

## 6. Languages

Every label, finding name, surface, status and tab is provided in English, Urdu and Arabic, with right-to-left layout matching the rest of the app.

## Technical notes

- New tables, each with grants, org-scoped RLS and updated_at triggers following existing dental patterns: `dental_findings_catalog` (CDT code, category, colour, scope, favourite flag), `dental_chart_findings` (multi-finding per tooth/surface with status + closed_at, replacing the single-condition-per-tooth limit while `dental_charts`/`dental_tooth_surfaces` stay for compatibility), `dental_consents`, `dental_endo_records`, `dental_surgery_notes`, `dental_implants`, `dental_ortho_records`, `dental_aligner_trays`, `dental_ceph_measurements`, `dental_prostho_records`, `dental_lab_orders`, `dental_oral_medicine_findings`, `dental_postop_records`, `dental_chairside_visits`. `dental_images` gains `modality` and tooth link.
- Frontend: new `src/pages/app/dental/DentalWorkspacePage.tsx` shell with lazy tab panels under `src/components/dental/workspace/`; new SVG tooth renderer `src/components/dental/ToothGlyph.tsx` + rewritten `Odontogram2D.tsx` (arch layout, occlusal plane, surface-box grid, shift-click multi-select); new `FindingPanel.tsx` (search, favourites, status, notes, Chart/Repeat); `src/lib/dental/notation.ts` for FDI/Universal/Palmer conversion; `src/lib/dental/i18n.ts` extended for all new strings; `src/hooks/useDentalWorkspace.ts` for the new queries/mutations.
- History mode reads `dental_chart_history` to render the chart as of a chosen date.
- 3D stays on `@react-three/fiber` v8 / `drei` v9; teeth are memoised and kept inside a mobile-friendly draw-call budget.
- Delivered in phases: (1) workspace shell + redesigned odontogram + finding panel + treatment plan/perio/billing wiring, (2) speciality tabs, (3) scans/CBCT and history scrubber polish. Each phase verified with screenshots before hand-off.

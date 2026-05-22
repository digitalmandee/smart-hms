# Next skills batch

Add three more auto-loading skills, drafted under `.agents/skills/` and activated via `skills--apply_draft`.

## 1. clinical-workflow-conventions

**Triggers on:** OPD, IPD, lab, imaging, dialysis, surgery/OT, blood bank, dental, ward medication work.

**Covers:**
- OPD walk-in 4-step wizard (mandatory upfront payment → invoice/token)
- OPD roles: doctors consult, nurses record vitals and bypass payment gates
- IPD admission: Procedure + Attending Doctor mandatory at registration
- Order → payment sync: link lab/imaging to `invoice_id` BEFORE payment record
- Lab lifecycle: Save → Submit → Publish; specimen ID `{PREFIX}-{YYMMDD}-{SEQ}`, locks fields on Collected
- Lab result template matching priority: `service_type_id` → `test_name` → substring
- Imaging: `imaging_orders` lacks FK to `service_types` (manual join + fuzzy match)
- Radiology lifecycle: Pending → Reported → Verified → Delivered
- Dialysis: decoupled nurse/doctor flow, `DS-YYYYMMDD-XXX` ID
- Surgery OT: completion auto-posts journal + FIFO consumable deduction
- Blood bank: 35-day expiry default, mandatory tests, OPD/Surgery integration
- Dental: 3D tooth chart (@react-three/fiber), per-surface mapping
- Ward medication: administered IPD med auto-creates `ipd_charges`
- Child registration: 'Child' gender enforces mandatory guardian
- Consumable policy: no automated per-test deduction, use `cost_price`

Reference files: `opd-flows.md`, `lab-imaging.md`, `ipd-surgery.md`.

## 2. ksa-compliance

**Triggers on:** ZATCA, NPHIES, Wasfaty, Tatmeen, Nafath, Sehhaty, HESN, Saudi ID validation, Hijri dates, KSA-specific UI.

**Covers:**
- ZATCA Phase 1 & 2: UBL 2.1 XML, SHA-256 hash, mandatory invoice chaining
- NPHIES: HL7 FHIR workflow, `medical_codes` lookup, claim scrubbing
- Insurance billing: coverage vs copay calc, post-invoice claim prompt, mandatory IPD insurance check
- KSA regulatory actions conditionally rendered (Nafath, Tatmeen/RSD, Sehhaty)
- Wasfaty e-prescription: MOH integration via `wasfaty-gateway` edge fn + `wasfaty_prescriptions`
- Saudi ID validation: 10 digits, starting with 1 (citizen) or 2 (iqama)
- Dual-calendar (Gregorian + Hijri) gated by KSA country code
- Insurance routing: standalone top-level module at `/app/insurance/*`
- HIPAA: storage RLS, PHI masking, session timeouts, kiosk security-definer

Reference files: `zatca-einvoicing.md`, `nphies-claims.md`, `wasfaty.md`.

## 3. investor-deck-editing

**Triggers on:** slide edits, executive/investor deck, pitch content, deck translation, deck navigation.

**Covers:**
- Where the deck lives (route + component map — to be confirmed during authoring)
- Runtime translation pattern shared with the rest of the app (EN/AR/UR)
- Tone rule: functional descriptive language, no "CFO-grade/ready" buzzwords
- Slide-component conventions (layout, typography, motion primitives in use)
- How to add/reorder slides without breaking the deck navigation
- Image/asset placement and aspect rules
- Print/PDF export caveats if any

Reference files: `slide-structure.md`, `tone-and-copy.md`.

## Process

For each skill:
1. Create `.agents/skills/<name>/SKILL.md` with frontmatter (`name`, `description` carefully tuned so retrieval fires on the right requests).
2. Add focused reference files under `references/` (only what won't fit cleanly in SKILL.md).
3. Run `skills--apply_draft .agents/skills/<name>` to activate.

For `investor-deck-editing` I'll first locate the deck files in the repo (likely under `src/pages/` or `src/components/deck/`) so the skill points at real paths.

No runtime app code is changed — these are agent-only knowledge files.

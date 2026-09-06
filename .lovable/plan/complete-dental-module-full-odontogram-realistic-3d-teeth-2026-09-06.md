# Complete Dental Module: Full Odontogram + Realistic 3D Teeth

Today the dental section has a patient list, treatments, procedures catalog, images and reports, but the chart itself is thin: teeth are coloured boxes and cylinders in the 3D view, only one condition can be stored per tooth, surfaces are never recorded (the surface picker exists but is not connected to anything), and there is no adult/child switch, no gum health charting, and no treatment plan built from the chart.

This plan completes the dental module around a real odontogram.

## 1. Proper odontogram (the tooth chart)

- **Adult (32 teeth) and child (20 teeth) dentitions**, switchable, in FDI numbering (11-48 adult, 51-85 primary).
- **Per-surface charting**: click a tooth, pick the affected surfaces (Mesial, Distal, Buccal/Facial, Lingual/Palatal, Occlusal/Incisal) and set a condition per surface, not just per tooth. The whole-tooth states (missing, implant, crown, bridge, root canal, extraction planned) stay at tooth level.
- **Condition palette** extended to what dentists actually chart: caries, filling/restoration (amalgam vs composite), crown, bridge pontic/abutment, veneer, implant, root canal, sealant, fracture, mobility, impacted, unerupted, supernumerary, missing, extracted, to-be-extracted.
- **Chart mode toolbar**: pick a condition, then click teeth/surfaces to paint it — much faster than the current one-dropdown-per-tooth flow.
- **Chart history**: every change is versioned, with a per-tooth timeline and a "chart as of date" view so progression is visible.
- **Legend, quick actions** (mark quadrant, reset tooth) and printable/exportable chart image for the patient record.

## 2. Realistic 3D teeth

- Replace the box/cylinder placeholders with anatomically distinct tooth shapes per class — incisor, canine, premolar (with two cusps), molar (with four cusps and root split) — set in a correct upper/lower arch with gum tissue.
- Preference is to use a free (CC0) dental model set if one can be validated; otherwise the teeth are built procedurally with proper crown/root profiles, which is a large step up from the current primitives.
- **Surface-level colouring in 3D**: each tooth's crown is split into its five surfaces so a charted surface lights up on the actual face of the tooth.
- Orbit/zoom, upper-only / lower-only / both views, hover labels, selected-tooth highlight, and a soft clinical lighting setup instead of the flat look.
- A **2D odontogram** stays available as the fast, print-friendly view, and it becomes fully surface-aware too (the classic five-box tooth diagram).

## 3. Clinical workflow completion

- **Periodontal charting**: pocket depths (6 sites per tooth), bleeding on probing, recession, mobility and furcation, with a plaque/bleeding index summary.
- **Treatment plans**: group treatments into a plan created straight from charted findings ("tooth 36 MOD caries -> composite filling"), with phases, total cost, patient acceptance status, and progress tracking. Planned items flow into the existing treatment records and the same invoice/billing path already used.
- **Chart to billing**: selecting a procedure from the catalog on a charted tooth pre-fills cost and posts through the existing dental treatment -> invoice flow (no accounting changes).
- **Images on the chart**: existing dental images become linkable per tooth and are shown when a tooth is selected.
- **Dashboard and reports** gain chart-driven figures: caries load, teeth treated, plan acceptance rate, pending planned procedures.

## 4. Languages

All new labels, conditions, surfaces and screens are provided in English, Urdu and Arabic, with right-to-left layout handled the same way the rest of the app does it.

## Technical notes

- New tables (each with grants, RLS and org scoping following existing patterns): `dental_tooth_surfaces` (per-tooth-surface condition state), `dental_chart_history` (versioned change log), `dental_perio_charts` (per-tooth, per-site measurements), `dental_treatment_plans` + `dental_treatment_plan_items`. `dental_charts` gains `dentition` (permanent/primary) and whole-tooth flags; `dental_images` gains an optional tooth link. Existing chart rows keep working.
- Frontend: rewrite `src/components/dental/Dental3DChart.tsx` (per-class tooth geometry, per-surface mesh groups, gums, lighting), rewrite `src/components/dental/ToothSurfaceSelector.tsx` into a wired surface picker, add `Odontogram2D`, `ToothDetailPanel`, `PerioChart`, and a charting toolbar; extend `src/hooks/useDental.ts` with the new queries/mutations; add treatment-plan pages under `src/pages/app/dental/` and register routes in `App.tsx` and the dental sidebar.
- 3D stack stays on the existing `@react-three/fiber` v8 / `drei` v9 (React 18); teeth are instanced and kept within a mobile-friendly draw-call budget, and rendering is verified with screenshots before hand-off.
- No changes to accounting triggers or existing invoice logic.

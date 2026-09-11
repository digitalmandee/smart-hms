# Pitch deck: branded opening, pharmacy + AI SOAP focus, honest compliance status

Three changes to the 4-minute pitch at `/pitch`. The executive deck stays as it is.

## 1. Opening slide matches the main presentation

Replace the current plain opening with the same look as the first slide of `/presentation`:

- Full HealthOS 24 logo lockup with tagline (not just the small icon)
- Big two-line headline with the second line in brand colour
- Row of capability pills (OPD & IPD, Laboratory, Pharmacy, Billing, HR & Payroll, Accounts, OT & Surgery, Radiology, Tabeebi AI)
- Stats bar in a bordered card
- Bottom trust row: Cloud-based, HIPAA controls, Multi-branch, plus date and site
- Language chips: English, عربي, اردو

Keeps the pitch slide sizing so the PDF export still works.

## 2. New slide: Pharmacy + AI SOAP notes (the "catchy" one)

A single strong slide placed right after the Tabeebi slide, built as one connected story:

**Doctor speaks → SOAP note writes itself → prescription flows straight into pharmacy → stock, price and invoice all update.**

Left side — AI SOAP notes:
- Voice dictation in English, Arabic or Urdu
- Subjective / Objective / Assessment / Plan filled automatically, shown as a small visual note card
- Doctor reviews and signs; nothing saves without sign-off

Right side — Pharmacy that reacts instantly:
- Prescription lands in pharmacy queue with no re-typing
- Interaction and allergy check before dispensing
- Batch and expiry picked automatically, stock deducted
- Price, cost of goods and invoice posted in the same second

Bottom strip: four short outcome chips (no typing, no re-entry, no stock guesswork, no missed charge).

## 3. Compliance slide rewritten with real status

Split into two clearly labelled columns so nothing is overclaimed:

**Completed and live in the product**
- HIPAA technical safeguards: private storage with per-organisation access rules, PHI field masking, full access and export audit trail, role-based session timeouts, multi-factor sign-in, breach-notification tracking, workforce training records, BAA register, HIPAA dashboard
- Row-level data isolation per branch and role
- ZATCA Phase 1 and Phase 2 e-invoice generation with hashing and chaining
- Arabic / Urdu / English with full right-to-left support

**In progress**
- NPHIES production onboarding (workflow and claim scrubbing built, payer certification pending)
- Wasfaty, Tatmeen, Nafath, HESN, Sehhaty live-credential certification (integrations built and testable)
- HIPAA independent audit and attestation
- SOC 2 Type II and ISO 27001 programme
- Two hosting-level settings to switch on at go-live (leaked-password protection, scheduled data-retention purge)

Each item carries a small status badge, so the slide reads as credible rather than a wall of ticks.

## Assumptions

- "In process" items above are marked that way because the code implements them but external certification/audit is not evidenced in the project. If any of them is already certified, tell me and I will move it to the completed column.
- SOC 2 / ISO 27001 / GDPR were previously shown as "ready/compliant" on the older presentation slide; I am moving them to "in progress" unless you confirm otherwise.

## Technical notes

- Rework `PitchOpeningSlide` in `src/components/pitch/PitchSlidesA.tsx`, reusing `HealthOS24Logo` (`variant="full"`, `showTagline`) and the layout pattern from `src/components/presentation/TitleSlide.tsx`.
- New `src/components/pitch/PitchPharmacyAiSlide.tsx`, inserted in `src/pages/PitchDeck.tsx` after `PitchTabeebiSlide`.
- Rewrite `PitchCompliancePitchSlide` in `src/components/pitch/PitchSlidesB.tsx` with `completed` / `inProgress` arrays and a status badge.
- `TOTAL_SLIDES` goes 11 → 12; renumber every `SlideFooter` label.
- Verify with a TypeScript check and a Playwright pass confirming 12 slides render and the PDF export still captures all of them.

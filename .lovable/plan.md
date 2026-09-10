# 4-Minute Pitch Deck

A short, standalone deck you can click through in about 4 minutes at `/pitch`. English only. It covers the whole product, the mobile apps for doctor / patient / nurse / staff, every module, and a direct comparison against the big global systems (Epic, Cerner/Oracle Health, InterSystems).

## Slides (9 slides, ~25 seconds each)

1. **Opening** — Product name, one-line promise, three headline numbers (modules, roles, languages).
2. **The problem** — Hospitals running 8-10 disconnected systems: paper, Excel, separate lab/pharmacy/finance tools.
3. **One platform, every department** — Full module map grouped into Clinical, Diagnostics, Pharmacy & Supply, Finance & HR, Compliance, Patient-facing. Nothing hidden behind "and more".
4. **A patient's journey in one flow** — Arrival, token, consultation, lab, pharmacy, invoice, insurance claim; each step showing the module that handles it.
5. **Mobile apps** — Four phones side by side: Doctor, Patient, Nurse, Staff, each with real captured screens and the 3 things that role does on the phone.
6. **AI built in** — Tabeebi voice notes, drug interaction alerts, critical lab flags, claim scrubbing, coding assistance.
7. **Us vs the global systems** — Comparison table: us against Epic, Cerner/Oracle Health, InterSystems, across cost per bed, go-live time, Arabic/RTL, KSA compliance (NPHIES, ZATCA, Wasfaty, Nafath), mobile apps, AI, all-in-one scope.
8. **Compliance and security** — KSA regulatory stack, HIPAA controls, role-based access, audit trail, multi-branch.
9. **Close** — Single strong statement plus four proof chips (modules, languages, KSA-ready, go-live time).

## Mobile screenshots

I will capture real screens from the running app for the four roles. The Supabase project is external, so an authenticated session may not be available in my sandbox; if a role's screen cannot be reached, I will capture what is reachable and note in my reply exactly which role images need you to send a screenshot from your device instead. No invented UI will be presented as real.

## Numbers rule

Only figures already in the project (module counts, languages, KSA integrations, existing pricing comparisons in the current deck) are used. Anything I do not have a real source for is left out rather than invented; the cost-per-bed comparison reuses the figures already in the existing deck.

## Technical notes

- New page `src/pages/PitchDeck.tsx` with its own slide components under `src/components/pitch/`, following the existing `.slide` class pattern so the print/PDF export works the same way.
- Route `/pitch` added in `src/App.tsx` with SEO title and description.
- Reuses the existing deck's PDF/print export logic (jsPDF + html-to-image) so you can download the 9 slides as a PDF.
- Existing `/executive-presentation` deck is left untouched.
- English only for now; strings kept in plain arrays so Arabic and Urdu can be added later without restructuring.

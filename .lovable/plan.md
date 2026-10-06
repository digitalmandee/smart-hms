# Clean hidden modules out of all dashboards

Menus already hide Surgery/OT, Radiology, Anesthesia, Emergency, Dialysis, Dental, Insurance/NPHIES etc. But dashboard cards, buttons and quick links still show them. This removes them from dashboards using the same central on/off switch, so they come back automatically if a module is turned on again.

## What gets cleaned

- **Reception dashboard**: remove "All Surgeries" button, "Pending Surgery Requests" and "Upcoming Surgeries" cards.
- **Main / admin dashboard**: remove the NPHIES insurance card; stop sending radiologist roles to the hidden Radiology page.
- **Billing dashboard**: remove the NPHIES insurance card.
- **IPD dashboard**: remove the "Today's Procedures/Surgeries" tile.
- **Executive report**: remove Radiology and Surgery/OT tiles and their revenue lines.
- **Mobile dashboards** (doctor, nurse, staff): remove any surgery/radiology/emergency shortcuts or cards.
- **IPD admission/discharge forms**: hide the "Surgery Recommended" banner and Surgery charges section when there's nothing to show.
- Full sweep of all other dashboards and home widgets for the same hidden items; anything found gets the same treatment.

Nothing is deleted — pages and data stay, only hidden. All labels remain in English, Urdu and Arabic.

## Check

Sign in with quick-login as Hospital Admin, Reception, Doctor, Nurse, Billing and IPD, screenshot each dashboard, and confirm no surgery/radiology/insurance/etc. items remain and nothing breaks.

## Technical details

- Add `isModuleHidden(pathOrKey)` helper in `src/lib/facility-type-filter.ts` reading `GLOBALLY_HIDDEN_PREFIXES`; wrap the widgets above with it (no deletions).
- Skip hidden-module queries (e.g. surgeries count in `useIPDDashboardStats`, radiology/surgery in executive summary) when hidden.
- Remove redirect entries for roles whose target path is hidden in `DashboardPage` `ROLE_DASHBOARD_MAP`.

# Patient form NGO review + one-screen Book Appointment

## Findings
**Patient form**: it covers basic details, guardian (for a child), father/husband, emergency contact, address, insurance and referral. It has no welfare or need-assessment details, so reception can't record whether a patient is eligible for Zakat or Sadaqah. Insurance is still shown, even though Insurance is hidden in the rest of the app.

**Book Appointment**: two columns of 4–5 stacked cards (Patient, Details, Time Slot, Additional Info, then Payment), so staff have to scroll the page.

## 1. Patient form for an NGO hospital
Add a new **"Welfare / Need Assessment"** section, in English, Urdu and Arabic:
- Needs welfare (yes/no) toggle. The fields below only show when it's on.
- Monthly household income, family members, earning members
- Occupation of the head of household, house (own/rented/none)
- Zakat eligible (yes/no), preferred fund (Zakat / Sadaqah / Any eligible)
- Suggested coverage % (0–100)
- Referred by (self / NGO / mosque / doctor), assessment notes
- National ID (CNIC) becomes required when "Needs welfare" is on

Other changes:
- Hide the Insurance fields.
- The Front Desk welfare screen fills in the saved fund and coverage % automatically.
- The patient profile shows a "Welfare patient" badge.

## 2. Book Appointment on one screen (no page scroll on desktop)
A three-column layout that fits the screen height:
```text
| Patient search + selected card | Branch, Doctor, Type, Date | Time slots (scroll inside) |
| Chief complaint + notes (compact)                          | Payment + Book button      |
```
- Smaller card headers, two fields per row, notes shortened to 2 lines
- Only the time slot list scrolls, inside its own box
- On phone it stays one column, as it is today
- Right-to-left layout is kept for Urdu and Arabic

## Technical details
- Migration: add nullable columns to `patients`: `needs_welfare bool default false`, `monthly_income numeric`, `family_members int`, `earning_members int`, `housing_status text`, `zakat_eligible bool`, `preferred_fund text`, `suggested_coverage_pct numeric`, `welfare_notes text`. Existing RLS already covers these.
- PatientFormPage.tsx: zod schema + new collapsible section; `superRefine` for CNIC when `needs_welfare`; drop the insurance block.
- Front Desk page: prefill from the patient record.
- AppointmentFormPage.tsx: `lg:grid-cols-3`, `lg:h-[calc(100vh-…)]`, `overflow-hidden` with an inner `overflow-y-auto` for TimeSlotPicker; payment card moves into column 3.
- i18n keys added to en/ur/ar.

## Two changes

### 1. Remove Founder Story slide from position 2

The "Founder Story" slide (`ExecAboutUsSlide.tsx`) currently sits at slide 2/32 with a hardcoded "Ahmed Raza" placeholder. This doesn't fit standard pitch-deck flow (Title → Problem → Solution → …) and the name is wrong anyway (real founders are Sannan Malik and Farhan Saleem, shown on slide 29).

**Fix:** drop `ExecAboutUsSlide` from the deck entirely. The existing `ExecTeamSlide.tsx` near the end already covers the founders properly. Deck becomes **31 slides**.

New order at the top: Title → Problem → Why Now → All-in-One → Modules → Tabeebi → Customer Story → … (Team stays where it is).

### 2. Redesign Mobile Apps slide to match brand

Current slide uses bright cyan→blue gradients, dark-navy plastic phone frames with rainbow tints (blue/indigo for Doctor, emerald/teal for Patient), and a chunky cyan→sky→blue top bar. That doesn't match the rest of the deck, which uses:
- subtle `from-{accent}/5 via-background` washes
- white/card phone surfaces with the HealthOS primary color as the only accent
- single-color top bar in `primary`

**Fix:** rebuild `ExecMobileAppsSlide.tsx` with:
- Same header/footer chrome pattern as other slides (primary accent, `X / 31` counter).
- Clean white phone mockups with thin bezels, primary-blue status accents, real HealthOS UI patterns (cards, badges, lists) instead of gradient candy.
- Keep the 4 role tiles (Doctor / Nurse / Patient / Reception) but use the same card style as `ExecModulesSlide`.
- Keep tech chips row (Capacitor iOS+Android, offline sync, biometric, push) and the PDPL/Nafath/Sehhaty trust pill, restyled to match brand tokens.

---

## Files to change (on approval)

- `src/pages/ExecutivePresentation.tsx` — remove `ExecAboutUsSlide` import + render; update `TOTAL_SLIDES` from 32 to 31.
- All 31 remaining slide files in `src/components/executive/` — update the `X / 32` counter to `X / 31` and renumber slides 3-32 down by one (Problem becomes 2/31, Why Now 3/31, etc.).
- `src/components/executive/ExecMobileAppsSlide.tsx` — full visual rewrite matching brand pattern (keeps the same content, only design changes).
- Leave `ExecAboutUsSlide.tsx` file on disk but unused (no import) so we don't break anything else; can delete in a later pass.

## Out of scope

- No content changes to slides other than counter renumbering and the Mobile Apps redesign.
- No founder bio rewrites (Team slide at the end stays as-is).
- No new images generated.

## Questions before I build

1. Confirm: **delete the founder slide entirely** (31 slides), or move the founder content into the existing Team slide near the end? I'm proposing delete since Team already shows them.
2. For the Mobile Apps redesign, should I match the **subtle primary-blue / white-card** style of `ExecModulesSlide` and `ExecTitleSlide`, or do you have a specific landing-page section in mind I should mirror?


Issue confirmed from your screenshot: this is the tablet drawer sidebar (DashboardLayout → `SheetContent` → `DynamicSidebar`), and the top brand row still feels centered instead of right-aligned in RTL.

Plan to fix:

1. Target the real failing area (`src/components/DynamicSidebar.tsx`, logo/header row)
- Replace the current single reversed flex row with explicit layout zones:
  - Brand group (logo badge + “HealthOS 24” text)
  - Action group (close/collapse button)
- Stop relying on `ms-auto` + full-row reverse for placement.

2. Force correct RTL brand alignment
- In the brand group, apply RTL-specific direction and text alignment:
  - `flex-row-reverse` only on the brand group (not the whole header row)
  - Title gets `flex-1 min-w-0` + `text-end` + `truncate` in RTL
- This keeps the title visually anchored to the logo on the right side in Arabic/Urdu.

3. Keep button placement deterministic
- For close/collapse buttons, use explicit order/alignment classes by locale:
  - RTL: button pinned to the left side
  - LTR: button pinned to the right side
- Remove the ambiguous auto-margin behavior that currently causes center drift.

4. Apply consistency pass to mobile sidebar component
- Review `src/components/mobile/MobileSideMenu.tsx` header/footer rows and ensure the same pattern (explicit text alignment + deterministic button ordering), so “all sidebars” behave consistently.

5. Validation checklist after implementation
- Test in Arabic + Urdu on:
  - Tablet drawer sidebar (`/app/dashboard` around current viewport)
  - Desktop expanded/collapsed sidebar
  - Mobile side menu
- Confirm:
  - Menu icons right, chevrons left
  - Brand title right-aligned with logo
  - No regression in English/LTR.

Technical detail:
The root cause is not translation itself; it’s mixed use of `flex-row-reverse` at container level plus logical auto margins (`ms-auto`) and non-flexing title text. The fix is to scope reversal to the specific group and give the title its own flexible, RTL-aligned text container.

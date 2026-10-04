# Blood Donation Camps (outdoor drives)

There's no blood camp feature in the app yet. The existing "Campaigns" screen is for money donations only. This plan adds camps to the Blood Bank, so blood collected at a camp follows the same safety steps as blood collected in the hospital.

## How a camp works

```text
Plan camp -> Run camp on the day -> Transport bags -> Receive at blood bank -> Test -> Split -> Stock -> Cross-match -> Issue
```

1. **Plan the camp**: name (e.g. "XYZ University Drive"), location/address, date, start and end time, organiser/partner, contact person, camp in-charge, team (doctor, phlebotomists, nurse), target number of bags, and the bag/kit stock sent out.
2. **On the day, on a phone or tablet**: the team opens the camp and registers each donor. They can search existing donors or quickly add a new one. Each donor gets the same health questionnaire, the haemoglobin and weight check, and the eligibility rules used in the hospital. Ineligible donors are deferred with a reason. Each collected bag gets a bag number, the volume and the time, and is linked to the camp.
3. **Close the camp**: the screen shows the totals — registered, deferred, collected, bags left over, and why donors were deferred. The in-charge signs off.
4. **Transport (cold chain)**: staff record when the box left, its temperature on departure and on arrival, who carried it, and the number of bags. If the temperature was out of range or a bag is missing, it's flagged.
5. **Receive at the blood bank**: staff tick each bag off against the camp list. Accepted bags go into quarantine stock. Damaged or missing bags are recorded with a reason. Cross-match is never done at the camp.
6. **From here the normal hospital flow applies**: screening tests (HIV, HBV, HCV, syphilis, malaria), splitting the bag into parts, stock, cross-match against a patient request, issuing and billing. Each bag always shows which camp it came from.
7. **Camp report**: collected, accepted, failed tests, discarded, issued to patients, and the cost per bag. Donors get a thank-you message by WhatsApp or text, and are reminded when they can donate again (after 56 days).

## Screens (English, Urdu, Arabic, with Urdu and Arabic shown right-to-left)
- Blood Bank > Camps: a list with status (Planned, Ongoing, Closed, Received).
- Camp page with tabs: Details, Team & Kits, Donors & Bags, Transport, Receiving, Report.
- A phone-friendly "camp mode" screen for registering donors on site.
- Bag and stock pages show a "Camp: XYZ" label.

## Who sees it
Blood bank staff and the hospital admin only.

## Technical details
- New tables: `blood_camps` (name, location, lat/lng, dates, organiser, in-charge, target, status planned/ongoing/closed/received), `blood_camp_staff`, `blood_camp_transport` (departure/arrival temperatures and times, carrier, bag count, flagged). Each table gets the standard access permissions, row security limited to the user's own hospital, and timestamps.
- `blood_donations.camp_id` and `blood_inventory.camp_id` (nullable).
- `blood_donations.received_status` (pending/accepted/rejected) plus a receiving reason. A trigger stops a camp donation from being split into parts until it has been accepted at receiving.
- Eligibility uses the existing `check_donor_eligibility` / `defer_blood_donor` functions. Screening, splitting, cross-match and issuing reuse the existing triggers and remote functions without changes.
- A remote function `receive_camp_bags(camp_id, accepted[], rejected[{id, reason}])` updates everything at once, and moves the camp to "received" once every bag is accounted for.
- Hooks are added to `useBloodBank.ts`. New pages go under `src/pages/app/blood-bank/camps/`, plus a sidebar entry in the Blood Bank menu.

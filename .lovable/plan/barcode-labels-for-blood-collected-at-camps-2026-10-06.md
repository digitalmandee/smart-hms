# Barcode labels for blood collected at camps

## What exists today
- Blood Camps: you plan a camp, register donors on site, and each bag is recorded against that camp with a bag number.
- Bag Labels page: prints barcode labels, but only for bags that are already in stock. Camp bags reach stock only after the blood bank receives and splits them, so nothing can be printed at the camp.

## What gets added
1. **Label printed at collection**: after each donor is saved in camp mode, a "Print label" button prints one sticker for the bag. It shows the barcode (donation number), camp name and number, blood group (or "Pending" if not known yet), donor number, collection date and time, and volume. Pilot tubes get two smaller sample stickers with the same barcode.
2. **Print all camp labels**: the camp's Donors & Bags tab gets "Print all labels" (and print only the ones you tick), laid out for a sticker sheet or a 50x25 mm label printer.
3. **Scan to receive**: on the Receiving tab, scanning a bag's barcode ticks it off as accepted, so you don't have to search the list.
4. **Labels for the separated parts**: once a camp bag is split (red cells, plasma, platelets), each part's label shows "Camp: XYZ" and links back to the original donation barcode.
5. All labels and buttons in English, Urdu and Arabic. Urdu and Arabic read right-to-left, and the barcode stays the same in every language.

## Technical details
- New `CampDonationLabel` component built with JsBarcode (CODE128 on `donation_number`), printed through a separate print window sized with `@page` (same pattern as the lab `BarcodeStickerPrint`).
- `CampDetailPage` Donors & Bags tab: row checkboxes, "Print selected" and "Print all". `DonationFormPage` with `?campId=` shows the print action after saving.
- Receiving tab: a scan input (keyboard-wedge scanner) that matches `donation_number`/`bag_number` and adds the bag to the accepted list.
- `BloodBagLabel`: shows the camp name when `camp_id` is set, plus the source donation number.
- Translation keys go in `camp-i18n.ts`. No database changes.

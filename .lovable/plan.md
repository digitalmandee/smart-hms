

# Extend Donation Management Module -- Proper Donor Profiles, Seed Data, and Module Enhancements

## Current State
The module has 4 sidebar items (Dashboard, Donors, Record Donation, Recurring Schedules) with 7 pages, but is minimal:
- No edit route for donors (`/app/donations/donors/:id/edit` is missing)
- No seed data -- donor list and dashboard are empty
- Donor profile page is basic (single column info card)
- No donor photo/avatar support
- No campaign/fund tracking
- No donation analytics or charts
- No pledge tracking page
- No ability to create recurring schedules from UI (page only lists them)

## Plan

### 1. Database: Add `donor_photo_url` Column + Seed 12 Demo Donors and 25 Donations

**Migration SQL:**
- Add `donor_photo_url TEXT` to `financial_donors`
- Seed 12 diverse donors (individual, corporate, foundation, anonymous) with realistic Pakistani names, phone numbers, CNIC, cities
- Seed 25 donations across these donors with various purposes (zakat, sadaqah, general, patient_welfare, building_fund), payment methods, and statuses
- Seed 3 recurring schedules (monthly zakat, quarterly corporate, annual foundation)
- Update `total_donated` and `total_donations_count` on the seeded donors

### 2. Add Missing Edit Route
Add `<Route path="donations/donors/:id/edit" element={<FinDonorFormPage />} />` in `App.tsx` -- currently clicking "Edit" on the donor detail page navigates to a non-existent route.

### 3. Enhanced Donor Profile Page (`DonorDetailPage.tsx`)
Redesign with:
- **Avatar/initials circle** at top with donor name, type badge, active status
- **Contact card** with phone, email, CNIC, address (icon-based layout)
- **Stats row**: Total donated, donation count, average donation, last donation date
- **Donation timeline** (vertical timeline of all donations with purpose tags)
- **Quick actions**: Record donation (pre-selects donor), create recurring schedule, print donor report

### 4. Enhanced Donor Form (`DonorFormPage.tsx`)
- Add `donor_photo_url` upload field (optional)
- Better grouped sections: Personal Info, Contact Details, Address, Notes

### 5. Create Recurring Schedule Form
Add a button on the Recurring Schedules page to create a new schedule with donor selection, amount, frequency, purpose, start date.

### 6. Dashboard Enhancements (`DonationDashboard.tsx`)
- Add a **purpose breakdown** bar chart (using recharts, already installed) showing donation amounts by purpose
- Add **monthly trend** line chart for the current year
- Quick stats: average donation amount, top donor this month

### 7. Translations
Add ~30 new translation keys across en/ar/ur for:
- New profile labels, chart labels, form sections
- Recurring schedule form labels
- Analytics labels

## Files to Edit/Create

| File | Action |
|------|--------|
| Migration SQL | New -- seed data + `donor_photo_url` column |
| `src/App.tsx` | Add edit route for donors |
| `src/pages/app/donations/DonorDetailPage.tsx` | Enhanced profile layout with avatar, timeline, quick actions |
| `src/pages/app/donations/DonorFormPage.tsx` | Minor -- add photo field |
| `src/pages/app/donations/DonationDashboard.tsx` | Add purpose breakdown chart + monthly trend chart |
| `src/pages/app/donations/RecurringSchedulesPage.tsx` | Add "Create Schedule" button + dialog form |
| `src/hooks/useDonations.ts` | Add monthly trend query, purpose breakdown query |
| `src/lib/i18n/translations/en.ts` | ~30 new keys |
| `src/lib/i18n/translations/ar.ts` | ~30 new keys |
| `src/lib/i18n/translations/ur.ts` | ~30 new keys |

## Seed Data Preview

```text
Donors (12):
  - Ahmad Rashid (Individual, Lahore)
  - Fatima Zahra (Individual, Karachi)  
  - Al-Shifa Foundation (Foundation, Islamabad)
  - Crescent Pharma Ltd (Corporate, Rawalpindi)
  - Haji Muhammad Yousuf (Individual, Peshawar)
  - Noor Medical Trust (Foundation, Multan)
  - Anonymous Donor
  - Zainab Bibi (Individual, Faisalabad)
  - Pakistan Steel Corp (Corporate, Karachi)
  - Dr. Khalid Mehmood (Individual, Lahore)
  - Baitul Maal Welfare (Government, Islamabad)
  - Khadija Hospital Trust (Foundation, Quetta)

Donations (25): Mix of zakat, sadaqah, general, patient welfare
  - Amounts: PKR 5,000 to PKR 500,000
  - Dates: Last 6 months
  - Statuses: mostly received, some pledged

Recurring (3):
  - Monthly zakat PKR 25,000
  - Quarterly corporate PKR 100,000  
  - Annual foundation PKR 500,000
```




# Donation Management Module for NGO Hospitals

## Context

This is about **financial donations** (charity/fundraising) for NGO hospitals -- completely separate from the existing Blood Bank donations. Currently there is no such module. The system supports `hospital`, `clinic`, `pharmacy`, and `warehouse` facility types but not explicitly `ngo`. NGO hospitals would use `facility_type = 'hospital'` with this module enabled.

## Architecture Decision

Add a new **"Donation Management"** module to the `available_modules` table (code: `donations`, category: `finance`) that can be enabled/disabled per organization via the existing module toggle system (OrgModulesPage + super admin OrganizationModulesTab). This keeps it optional -- only NGO/charity hospitals enable it.

## Database Schema

### New Tables

**`financial_donors`** -- People/organizations who give money
- `id` UUID PK
- `organization_id` UUID FK → organizations
- `branch_id` UUID FK → branches (nullable)
- `donor_number` TEXT (auto-generated: FD-YYYYMMDD-XXXX)
- `donor_type` TEXT ('individual', 'corporate', 'foundation', 'government', 'anonymous')
- `name` TEXT NOT NULL
- `name_ar` TEXT (Arabic name)
- `contact_person` TEXT (for corporate)
- `phone` TEXT
- `email` TEXT
- `cnic_passport` TEXT (national ID)
- `address` TEXT
- `city` TEXT
- `country` TEXT
- `notes` TEXT
- `is_active` BOOLEAN DEFAULT true
- `total_donated` NUMERIC DEFAULT 0
- `total_donations_count` INT DEFAULT 0
- `created_at`, `updated_at`

**`financial_donations`** -- Individual donation transactions
- `id` UUID PK
- `organization_id` UUID FK → organizations
- `branch_id` UUID FK → branches (nullable)
- `donor_id` UUID FK → financial_donors
- `donation_number` TEXT (auto-generated: FDON-YYYYMMDD-XXXX)
- `amount` NUMERIC NOT NULL
- `currency` TEXT DEFAULT 'PKR'
- `donation_date` DATE NOT NULL
- `donation_type` TEXT ('one_time', 'recurring', 'pledge', 'in_kind')
- `payment_method` TEXT ('cash', 'bank_transfer', 'cheque', 'online', 'mobile_wallet')
- `payment_reference` TEXT (cheque no, transaction ID)
- `purpose` TEXT ('general', 'building_fund', 'equipment', 'patient_welfare', 'zakat', 'sadaqah', 'fitrana', 'other')
- `purpose_detail` TEXT
- `receipt_number` TEXT
- `receipt_issued` BOOLEAN DEFAULT false
- `receipt_issued_at` TIMESTAMPTZ
- `notes` TEXT
- `status` TEXT ('received', 'pledged', 'cancelled', 'refunded') DEFAULT 'received'
- `created_by` UUID FK → profiles
- `created_at`, `updated_at`

**`donation_recurring_schedules`** -- For recurring donors
- `id` UUID PK
- `organization_id` UUID FK → organizations
- `donor_id` UUID FK → financial_donors
- `amount` NUMERIC NOT NULL
- `frequency` TEXT ('weekly', 'monthly', 'quarterly', 'semi_annual', 'annual')
- `purpose` TEXT
- `start_date` DATE
- `end_date` DATE (nullable -- ongoing if null)
- `next_due_date` DATE
- `last_donation_id` UUID FK → financial_donations (nullable)
- `is_active` BOOLEAN DEFAULT true
- `reminder_days_before` INT DEFAULT 3
- `total_collected` NUMERIC DEFAULT 0
- `installments_paid` INT DEFAULT 0
- `notes` TEXT
- `created_at`, `updated_at`

**`donation_reminders`** -- Reminder log
- `id` UUID PK
- `organization_id` UUID FK → organizations
- `schedule_id` UUID FK → donation_recurring_schedules
- `donor_id` UUID FK → financial_donors
- `reminder_date` DATE
- `reminder_type` TEXT ('upcoming', 'overdue', 'thank_you')
- `status` TEXT ('pending', 'sent', 'acknowledged') DEFAULT 'pending'
- `sent_at` TIMESTAMPTZ
- `notes` TEXT
- `created_at`

### Auto-Number Triggers

- `generate_financial_donor_number()` → FD-YYYYMMDD-XXXX
- `generate_financial_donation_number()` → FDON-YYYYMMDD-XXXX

### Journal Integration Trigger

- `post_donation_to_journal()` -- When a donation is received, auto-post:
  - Debit: Cash/Bank account
  - Credit: Donation Revenue account (REV-DON-001)

### RLS Policies

All tables: org-scoped access using `organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())`.

## Frontend Pages (7 pages)

| Page | Route | Description |
|------|-------|-------------|
| Donation Dashboard | `/app/donations` | Summary cards (total received, this month, pending pledges, recurring active), charts |
| Donors List | `/app/donations/donors` | Filterable list of financial donors with search, type filter |
| Donor Registration | `/app/donations/donors/new` | Form to register new donor |
| Donor Detail | `/app/donations/donors/:id` | Donor profile with donation history, recurring schedules |
| Record Donation | `/app/donations/record` | Form to record a new donation (select donor, amount, purpose, payment method) |
| Donation Receipt | `/app/donations/receipt/:id` | Printable donation receipt/slip with org header, donor info, amount, purpose |
| Recurring Schedules | `/app/donations/recurring` | List of active recurring schedules with due dates, overdue indicators |

## Donation Receipt/Slip

Printable receipt containing:
- Organization logo, name, address, tax number
- Receipt number, date
- Donor name, CNIC/passport
- Amount (in words + figures)
- Purpose (Zakat, Sadaqah, General, etc.)
- Payment method + reference
- Authorized signature line
- Trilingual support (English, Arabic, Urdu)

## Module Registration

Insert into `available_modules`:
- code: `donations`
- name: "Donation Management"
- category: `finance`
- icon: `Heart`
- is_hospital_only: false (clinics could also be NGO)
- is_core: false

Insert menu items under a new "Donations" parent:
1. Dashboard → `/app/donations`
2. Donors → `/app/donations/donors`
3. Record Donation → `/app/donations/record`
4. Recurring → `/app/donations/recurring`

## Translations

All UI strings in English, Arabic, and Urdu. Key namespaces:
- `donations.dashboard`, `donations.donors`, `donations.record`, `donations.receipt`
- `donations.purpose.zakat`, `donations.purpose.sadaqah`, `donations.purpose.fitrana`, `donations.purpose.general`, etc.
- `donations.type.oneTime`, `donations.type.recurring`, `donations.type.pledge`, `donations.type.inKind`
- `donations.reminder.upcoming`, `donations.reminder.overdue`, `donations.reminder.thankYou`

## Files to Create/Edit

| File | Action |
|------|--------|
| **Database** | Migration: 4 tables, 2 triggers, 1 journal trigger, RLS policies |
| **Database** | Insert: `available_modules` row + `menu_items` rows |
| `src/hooks/useDonations.ts` | **CREATE** -- CRUD hooks for donors, donations, schedules, reminders |
| `src/pages/app/donations/DonationDashboard.tsx` | **CREATE** |
| `src/pages/app/donations/DonorsListPage.tsx` | **CREATE** |
| `src/pages/app/donations/DonorFormPage.tsx` | **CREATE** |
| `src/pages/app/donations/DonorDetailPage.tsx` | **CREATE** |
| `src/pages/app/donations/RecordDonationPage.tsx` | **CREATE** |
| `src/pages/app/donations/DonationReceiptPage.tsx` | **CREATE** |
| `src/pages/app/donations/RecurringSchedulesPage.tsx` | **CREATE** |
| `src/components/donations/DonorCard.tsx` | **CREATE** |
| `src/components/donations/DonationReceiptPrint.tsx` | **CREATE** -- Printable receipt component |
| `src/App.tsx` | **EDIT** -- Add 7 routes |
| `src/components/DynamicSidebar.tsx` | **EDIT** -- Add sidebar name mappings |
| `src/lib/i18n/translations/en.ts` | **EDIT** -- Add ~50 donation keys |
| `src/lib/i18n/translations/ar.ts` | **EDIT** -- Add ~50 donation keys |
| `src/lib/i18n/translations/ur.ts` | **EDIT** -- Add ~50 donation keys |

## Implementation Order

1. Database migration (tables, triggers, RLS, journal integration)
2. Insert module + menu items
3. Create hooks
4. Create all 7 pages + 2 components
5. Add routes + sidebar mappings
6. Add translations




# Seed Donors Data and Chief Complaints

## Current State
- **Financial Donors**: 12 exist already
- **Financial Donations**: 25 exist already
- **Donation Campaigns**: 3 active campaigns exist
- **Recurring Schedules**: 3 exist
- **Chief Complaints**: Most appointments have `chief_complaint = NULL` -- needs seeding
- **No separate complaints table** -- complaints are stored as `chief_complaint` text field on `appointments` and `consultations` tables

## What Will Be Seeded

### 1. Additional Financial Donors (8 new donors)
Add variety with Pakistani/Arab names, different donor types (individual, corporate, trust), cities, and contact info. Names in English + Arabic.

### 2. Additional Donations (15 new donations)
Spread across existing + new donors, various purposes (general, zakat, sadaqah, building_fund), payment methods (cash, bank_transfer, online), linked to existing campaigns where relevant.

### 3. Chief Complaints on Appointments
Update all appointments that currently have `chief_complaint = NULL` with realistic medical complaints:
- Scheduled: "Fever and body aches for 3 days", "Follow-up for diabetes management"
- Checked-in: "Persistent headache and dizziness", "Chest pain on exertion"
- In-progress: "Chronic lower back pain", "Shortness of breath"
- Completed: "Abdominal pain and nausea", "Skin rash and itching"

## Implementation

All changes are **data inserts/updates** using the Supabase insert tool (no schema migrations needed).

### SQL Operations

**Step 1**: Insert 8 new financial donors with Pakistani names, Arabic names, CNIC numbers, phone numbers, cities across Pakistan

**Step 2**: Insert 15 new donations linked to donors, with various amounts (PKR 5,000 to PKR 500,000), dates spread over the last 2 months, various purposes and payment methods

**Step 3**: Update ~15 appointments to add realistic chief complaints covering common OPD presentations (fever, pain, diabetes follow-up, hypertension, respiratory issues, etc.)

## Data Details

### New Donors
| Name | Type | City | 
|------|------|------|
| Haji Muhammad Tariq | individual | Lahore |
| Al-Noor Foundation | trust | Karachi |
| Fatima Bibi | individual | Islamabad |
| Pak-Med Industries | corporate | Faisalabad |
| Sheikh Abdullah Al-Rashidi | individual | Riyadh |
| Crescent Welfare Society | trust | Multan |
| Bilal Ahmed Khan | individual | Rawalpindi |
| Gulf Medical Supplies | corporate | Dubai |

### Chief Complaints (sample)
- "Fever and body aches for 3 days"
- "Persistent headache and dizziness for 1 week"
- "Chest tightness and shortness of breath"
- "Follow-up for hypertension management"
- "Abdominal pain and nausea since yesterday"
- "Joint pain in both knees, worsening"
- "Chronic cough with sputum for 2 weeks"
- "Skin rash on arms and legs"
- "Lower back pain radiating to left leg"
- "Diabetic follow-up, blood sugar uncontrolled"


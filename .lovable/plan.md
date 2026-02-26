

# Donation Campaigns Feature

## Overview
Add a campaigns/fundraising feature to the Donation Management module. Campaigns let organizations create fundraising goals (e.g., "New MRI Machine", "Ramadan Patient Welfare Fund") with target amounts, date ranges, and progress tracking. Donors can contribute to specific campaigns, and the dashboard shows live progress bars.

## Database Changes

### New Table: `donation_campaigns`
```sql
CREATE TABLE donation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID REFERENCES branches(id),
  campaign_number TEXT NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  goal_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  collected_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  donor_count INT NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'general',  -- general, building, equipment, patient_welfare, zakat, emergency
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',  -- active, completed, paused, cancelled
  cover_image_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

- RLS: org-scoped read/write policies matching existing donation tables
- Auto-number trigger: `CAMP-YYYYMMDD-XXXX`

### Alter `financial_donations`: Add `campaign_id`
```sql
ALTER TABLE financial_donations ADD COLUMN campaign_id UUID REFERENCES donation_campaigns(id);
```

### Trigger: Auto-update campaign totals
On insert/update/delete on `financial_donations`, recalculate `collected_amount` and `donor_count` on the linked campaign.

### Seed Data
- 3 campaigns for the demo org:
  1. "New MRI Machine" -- PKR 5,000,000 goal, equipment category, ~60% funded
  2. "Ramadan Patient Welfare 2026" -- PKR 1,000,000 goal, patient_welfare, ~85% funded
  3. "Hospital Building Extension" -- PKR 10,000,000 goal, building, ~25% funded
- Link ~10 of the existing seeded donations to these campaigns
- Update `campaign_id` on those donations and recalculate totals

## Frontend Changes

### 1. New Page: `CampaignsListPage.tsx`
- Grid of campaign cards with:
  - Title, category badge, status badge
  - Progress bar (collected/goal with percentage)
  - Donor count, date range
  - Click to view detail
- "Create Campaign" button at top

### 2. New Page: `CampaignDetailPage.tsx`
- Campaign header with title, description, status
- Large progress bar with collected vs goal
- Stats row: donors, avg donation, days remaining
- Donations list filtered by this campaign
- Edit/pause/complete actions

### 3. New Page: `CampaignFormPage.tsx`
- Form with: title, title_ar, description, goal_amount, category, start_date, end_date
- Used for both create and edit

### 4. Update `RecordDonationPage.tsx`
- Add optional "Campaign" dropdown after purpose selector
- When a campaign is selected, set purpose to match campaign category

### 5. Update `DonationDashboard.tsx`
- Add "Active Campaigns" section below the charts showing top 3 active campaigns with progress bars

### 6. Sidebar Menu Item
- Insert new menu_item "Campaigns" under Donation Management parent (sort_order 5, path `/app/donations/campaigns`)

### 7. Routes in `App.tsx`
```
donations/campaigns          -> CampaignsListPage
donations/campaigns/new      -> CampaignFormPage
donations/campaigns/:id      -> CampaignDetailPage
donations/campaigns/:id/edit -> CampaignFormPage
```

### 8. Hooks in `useDonations.ts`
- `useDonationCampaigns()` -- list all campaigns for org
- `useDonationCampaign(id)` -- single campaign detail
- `useCreateCampaign()` -- create mutation
- `useUpdateCampaign()` -- update mutation

### 9. Translations (~25 new keys across en/ar/ur)
- Campaign-related labels: title, goal, collected, progress, category names, status labels, form labels

## Files to Create/Edit

| File | Action |
|------|--------|
| Migration SQL | New table + alter + trigger + RLS + seed |
| `src/pages/app/donations/CampaignsListPage.tsx` | New |
| `src/pages/app/donations/CampaignDetailPage.tsx` | New |
| `src/pages/app/donations/CampaignFormPage.tsx` | New |
| `src/pages/app/donations/RecordDonationPage.tsx` | Add campaign selector |
| `src/pages/app/donations/DonationDashboard.tsx` | Add active campaigns section |
| `src/hooks/useDonations.ts` | Add campaign hooks + types |
| `src/App.tsx` | Add 4 campaign routes |
| `src/components/DynamicSidebar.tsx` | Add "Campaigns" translation key |
| `src/lib/i18n/translations/en.ts` | ~25 new keys |
| `src/lib/i18n/translations/ar.ts` | ~25 new keys |
| `src/lib/i18n/translations/ur.ts` | ~25 new keys |
| Data insert: `menu_items` | Add "Campaigns" sidebar entry |

## Seed Campaign Preview

```text
Campaigns (3):
  1. "New MRI Machine"
     Goal: PKR 5,000,000 | Collected: ~3,000,000 (60%)
     Category: equipment | Status: active
     
  2. "Ramadan Patient Welfare 2026"
     Goal: PKR 1,000,000 | Collected: ~850,000 (85%)
     Category: patient_welfare | Status: active
     
  3. "Hospital Building Extension"
     Goal: PKR 10,000,000 | Collected: ~2,500,000 (25%)
     Category: building | Status: active
```


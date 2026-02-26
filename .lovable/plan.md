

# Campaign Sharing Feature -- Public Campaign Page with QR Code

## Overview
Add the ability for admins to share campaigns via a public-facing page that shows campaign progress, details, and organization branding. A QR code is generated for each campaign that links to this public page. No authentication required to view.

## Architecture

```text
Admin (CampaignDetailPage)
  └─ "Share" button → Dialog with:
       ├─ QR code image (downloadable)
       ├─ Public URL (copyable)
       └─ Social share links

Public Visitor
  └─ /campaign/{orgSlug}/{campaignNumber}
       ├─ Organization header (name, logo)
       ├─ Campaign title (en + ar)
       ├─ Progress bar with collected/goal
       ├─ Stats: donors, days remaining
       ├─ Category badge, date range
       └─ Footer with org contact
```

## Database Changes

**Add `share_token` column to `donation_campaigns`:**
- `share_token TEXT UNIQUE` -- a short random token auto-generated on insert for URL-safe sharing
- Trigger to auto-generate a 12-char alphanumeric token on insert
- Add an RLS policy allowing anonymous `SELECT` on `donation_campaigns` filtered by `share_token` or `campaign_number` (read-only, limited columns)

This allows public access without exposing UUIDs. The public page will query by org slug + campaign number.

## Files to Create/Edit

| File | Action |
|------|--------|
| Migration SQL | Add `share_token` column, auto-gen trigger, anon SELECT policy |
| `src/pages/public/PublicCampaignPage.tsx` | **New** -- public-facing campaign page (no auth) |
| `src/components/donations/CampaignShareDialog.tsx` | **New** -- share dialog with QR code, copy URL, download QR |
| `src/pages/app/donations/CampaignDetailPage.tsx` | Add "Share" button that opens the dialog |
| `src/lib/qrcode.ts` | Add `getCampaignPublicUrl()` helper |
| `src/App.tsx` | Add public route `/campaign/:orgSlug/:campaignNumber` |
| `src/lib/i18n/translations/en.ts` | ~15 new keys |
| `src/lib/i18n/translations/ar.ts` | ~15 new keys |
| `src/lib/i18n/translations/ur.ts` | ~15 new keys |

## Implementation Details

### 1. Migration: `share_token` + Anon RLS
```sql
ALTER TABLE donation_campaigns ADD COLUMN share_token TEXT UNIQUE;

-- Auto-generate token on insert
CREATE FUNCTION generate_campaign_share_token() ...
  NEW.share_token := substr(md5(random()::text || NEW.id::text), 1, 12);

-- Anon read policy (limited columns: title, title_ar, description, goal_amount,
-- collected_amount, donor_count, category, start_date, end_date, status, organization_id)
CREATE POLICY "anon_read_campaigns" ON donation_campaigns
  FOR SELECT TO anon USING (status = 'active');
```

Backfill existing campaigns with tokens.

### 2. Public Campaign Page (`PublicCampaignPage.tsx`)
- Route: `/campaign/:orgSlug/:campaignNumber`
- Fetches campaign by joining `donation_campaigns` with `organizations` on slug
- No auth required -- uses anon Supabase client
- Responsive, mobile-first design
- Shows: org name, campaign title (en/ar), large progress bar, goal/collected amounts, donor count, days remaining, category, date range
- Trilingual support based on browser locale detection
- Clean, branded layout suitable for sharing on social media

### 3. Share Dialog (`CampaignShareDialog.tsx`)
- Triggered from "Share" button on `CampaignDetailPage`
- Contains:
  - QR code image using existing `generateQRCodeUrl()` utility
  - Public URL with one-click copy button
  - Download QR code as image button
  - WhatsApp/Email share links (pre-filled message with campaign title + URL)
- Uses existing Dialog component from `@radix-ui/react-dialog`

### 4. CampaignDetailPage Updates
- Add a `Share` button (with `Share2` icon from lucide) in the actions bar alongside Edit/Pause/Complete
- Opens `CampaignShareDialog` passing campaign data

### 5. QR Code Helper
Add to `src/lib/qrcode.ts`:
```typescript
export const getCampaignPublicUrl = (orgSlug: string, campaignNumber: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/campaign/${orgSlug}/${campaignNumber}`;
};
```

### 6. Translations (~15 keys)
- `donations.shareCampaign` -- "Share Campaign" / "مشاركة الحملة" / "مہم شیئر کریں"
- `donations.publicLink` -- "Public Link"
- `donations.copyLink` -- "Copy Link"
- `donations.linkCopied` -- "Link copied!"
- `donations.downloadQR` -- "Download QR Code"
- `donations.shareViaWhatsApp` -- "Share via WhatsApp"
- `donations.shareViaEmail` -- "Share via Email"
- `donations.publicCampaignTitle` -- "Support This Campaign"
- `donations.campaignBy` -- "Campaign by"
- `donations.raisedOf` -- "raised of"
- `donations.campaignNotFound` -- "Campaign not found"
- `donations.campaignEnded` -- "This campaign has ended"
- `donations.supportMessage` -- "Your contribution makes a difference"


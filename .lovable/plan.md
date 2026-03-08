

# Plan: Add KSA Integrations to Branch Admin + Org Admin Sidebars

## Problem
KSA integration pages exist but aren't visible because:
1. **branch_admin** uses **database-driven menus** — no KSA menu items exist in the `menu_items` table
2. **org_admin** uses **static sidebar** in `role-sidebars.ts` — no KSA section defined there either

## Changes

### 1. Insert KSA menu items into `menu_items` table (Migration)

Add a top-level "KSA Integrations" parent and 8 children:

| Name | Path | Icon | Sort |
|------|------|------|------|
| **KSA Integrations** (parent) | — | ShieldAlert | 57 |
| Dashboard | /app/settings/ksa-integrations | LayoutDashboard | 1 |
| NPHIES | /app/settings/ksa/nphies | FileText | 2 |
| ZATCA Phase 2 | /app/settings/ksa/zatca | Receipt | 3 |
| Wasfaty | /app/settings/ksa/wasfaty | Pill | 4 |
| Tatmeen / RSD | /app/settings/ksa/tatmeen | ScanBarcode | 5 |
| HESN | /app/settings/ksa/hesn | ShieldAlert | 6 |
| Nafath | /app/settings/ksa/nafath | Fingerprint | 7 |
| Sehhaty | /app/settings/ksa/sehhaty | Smartphone | 8 |

This makes them visible to **branch_admin** (DB-driven sidebar).

### 2. Add KSA section to `org_admin` static sidebar (`src/config/role-sidebars.ts`)

Add a "KSA Integrations" group after the existing "Configuration" section in the `org_admin` config with the same 8 children listed above.

### 3. Add missing icon mappings (`src/components/DynamicSidebar.tsx`)

Add `ScanBarcode`, `Smartphone` to icon imports and `iconMap` entries (some like `Fingerprint`, `ShieldAlert`, `Pill`, `Receipt` are already imported).

### 4. Add sidebar name-to-key mappings

Add entries for "Dashboard" (under KSA context), "NPHIES", "ZATCA Phase 2", "Tatmeen / RSD", "HESN", "Nafath", "Sehhaty" to `SIDEBAR_NAME_TO_KEY` in both `DynamicSidebar.tsx` and `MobileSideMenu.tsx`.

## Files

| File | Action |
|------|--------|
| New migration SQL | INSERT 9 menu_items rows |
| `src/config/role-sidebars.ts` | Add KSA section to `org_admin` |
| `src/components/DynamicSidebar.tsx` | Add icons + name mappings |
| `src/components/mobile/MobileSideMenu.tsx` | Add name mappings |


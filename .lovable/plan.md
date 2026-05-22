# Create 3 Foundational Skills

Build the top-3 highest-ROI skills as drafts under `.agents/skills/`, then activate them via `skills--apply_draft`. These codify the conventions I currently re-learn from memory each session.

## Skill 1: `supabase-patterns`

**Triggers on:** any Supabase query, mutation, or migration work.

**SKILL.md contents:**
- The `.single()` → `.maybeSingle()` / `.select() + data?.[0]` rule with examples
- Empty string UUID → `null` mapping (with the exact pattern that bit us)
- Manual JS join strategy for tables without FKs — list the known tables (`pharmacy_pos_items`, `expenses`, `goods_received_notes`) and the join helper pattern
- `fetchAllRows` recursive helper to bypass the 1000-row limit
- Migration discipline: never edit `types.ts`, always use migrations for DDL
- Trigger idempotency: `IF EXISTS` guard pattern for reference IDs

**references/**
- `manual-joins.md` — full code examples
- `query-limits.md` — pagination helper code

## Skill 2: `arabic-rtl-translation` (+ Urdu scaffold)

**Triggers on:** adding/editing UI text, RTL layout work, executive presentation edits.

**SKILL.md contents:**
- Project rule: build everything in **3 languages** (English, Arabic, Urdu)
- Executive deck translation system: `ExecLangContext` + `ar.json` MutationObserver pattern, how to add new strings
- RTL Radix bypass: use `flex-row-reverse` + `text-end` instead of `dir` prop
- Radix Select empty value: `__none__` placeholder mapped to `''`
- Font usage: `font-arabic` (Noto Naskh / Noto Sans Arabic), Urdu uses Noto Nastaliq Urdu
- App-wide i18n location (`src/lib/i18n/`) vs deck-local i18n (`src/components/executive/i18n/`) — when to use which
- How to add an Urdu version (mirror the Arabic infra: `ur.json`, toggle option, `font-urdu`)

**references/**
- `add-translation-string.md` — step-by-step for adding new copy
- `rtl-layout-checklist.md` — common pitfalls (arrows, gradients, ms-/me-)

## Skill 3: `finance-gl-posting`

**Triggers on:** any finance/accounting/invoice/journal/voucher work.

**SKILL.md contents:**
- **Golden rule:** never write manual journal entries in app code — rely on idempotent DB triggers
- 4-level Chart of Accounts; journal posting allowed only at Level 4
- `entry_number` must be empty string (DB generates)
- `.toLowerCase()` on `account_types.category` in every query
- Prefix-based revenue routing: `IPD-`, `LAB-`, `DLY-`, etc. → which ledger
- Expense routing: `petty_cash`, `refund`, `staff_advance` route dynamically, else `5500`
- Deposit lifecycle: `LIA-DEP-001` → `AR-001` on application
- Vendor payment routing: DR `AP-001`, CR resolved asset
- Pharmacy COGS: POS auto-posts to `EXP-COGS-001` / `INV-001`
- IPD accrual lifecycle: off-ledger `ipd_charges` until discharge invoice
- Trigger idempotency: `IF EXISTS (reference_id)` guard pattern
- Daily closing blocked if any billing session open

**references/**
- `account-prefixes.md` — full routing table
- `trigger-pattern.md` — canonical idempotent trigger template

## Mechanics

For each skill:
1. Create `.agents/skills/<name>/SKILL.md` with proper YAML frontmatter (`name`, `description`)
2. Create `references/*.md` files with concrete code/SQL examples pulled from existing memory entries and codebase
3. Call `skills--apply_draft` with the directory path to activate

Descriptions in frontmatter must be specific enough for retrieval to match — e.g., "Supabase query, mutation, and join conventions for this HMS project including the .single() ban and manual JS joins" rather than just "Supabase rules".

## Out of scope (do later)

- `clinical-workflow-conventions`, `ksa-compliance`, `investor-deck-editing`, `radix-ui-gotchas`, `pharmacy-pos-flow`, `hr-payroll-engine`, `security-rls-patterns` — author these in a follow-up once the top 3 are validated in use.

## Deliverable

3 active skills surfaced automatically when relevant tasks come up, reducing the need for me to re-derive conventions from `mem://` index every session.

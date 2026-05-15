## Chunk 1 — Offline-Sync Engine (foundation for Clinic on Wheels & field workflows)

Goal: durable offline-first writes from any device (van tablet, nurse phone, kiosk). Anything written while offline gets queued locally, retried on reconnect, applied server-side with idempotency, and surfaced in a conflict UI when needed. This is the substrate every later module (CoW, Home Healthcare, Vaccination) plugs into.

### Pieces to build

**1. Client SDK — `src/lib/offline-sync/`**
- `db.ts` — Dexie (IndexedDB) wrapper with two stores: `outbox` (pending writes) and `cache` (last-known server state per entity).
- `outbox.ts` — `enqueue({ entity_type, operation, payload })` returns a `client_uuid`; assigns `device_id` (persistent in localStorage) and `client_created_at`.
- `sync-engine.ts` — background loop: when `navigator.onLine` and authenticated, drains outbox in FIFO batches of 25, calls the `cow-sync` edge function, marks rows applied/conflict/failed, exponential backoff on transient failure.
- `useOfflineSync()` hook — exposes `pending`, `failed`, `conflicts`, `lastSyncedAt`, `forceSync()`.
- `OfflineIndicator` component — top-bar pill: "Online · synced 2 min ago" / "Offline · 7 pending" / "3 conflicts" with click-through.

**2. Edge function — `supabase/functions/cow-sync/index.ts`**
- POST: `{ items: OutboxItem[] }`, validates JWT, validates each item with Zod.
- For each item, dispatch by `entity_type` to a dedicated handler:
  - `mobile_visits` → insert/update with `client_uuid` unique guard (idempotent — duplicate replays return the existing record).
  - `home_visits` → same pattern.
  - `immunizations` → same pattern, plus decrement `vaccine_lots.quantity_remaining`.
  - `payment_gateway_transactions` → status update only (cannot create payments offline).
- Upserts the row in `sync_outbox` with `status = applied | conflict | failed`, sets `applied_record_id`.
- Conflict detection: server `updated_at` newer than `client_created_at` → write `sync_conflicts` row, return `conflict` so the client can prompt the user.
- Returns per-item result `{ client_uuid, status, server_id?, error? }`.

**3. Conflict resolution UI — `src/pages/app/sync/`**
- `SyncDashboardPage.tsx` at `/app/sync` — lists pending, failed, conflicted items with filters by entity type and date.
- `ConflictDetailDialog.tsx` — side-by-side server vs client JSON diff, two actions: **Keep server** (discard local) or **Apply local** (overwrite server, posts a follow-up update).

**4. Wiring**
- Add Dexie dependency.
- Mount `<OfflineIndicator />` inside the existing app shell header.
- Add `/app/sync` route in `App.tsx` (admin/branch_admin/mobile_unit_crew/home_health_nurse only).
- Register the sync engine on auth-ready (start) and on logout (stop + clear outbox for that user).

### Technical sections

**Outbox row shape (client + server)**
```ts
{
  client_uuid: string;       // primary key, generated client-side
  device_id: string;
  user_id: string;
  organization_id: string;
  entity_type: 'mobile_visits' | 'home_visits' | 'immunizations' | 'payment_gateway_transactions';
  operation: 'insert' | 'update';
  payload: Record<string, unknown>;
  client_created_at: string; // ISO
}
```

**Idempotency contract**
- Every entity table participating in offline writes already has (or will be confirmed to have) a unique `client_uuid` column — `mobile_visits` and `sync_outbox` already do; `home_visits` and `immunizations` will be patched in a tiny follow-up migration if needed at implementation time.
- Server handlers always `INSERT … ON CONFLICT (client_uuid) DO UPDATE` so retries are safe.

**Auth & RLS**
- `cow-sync` runs with `verify_jwt = true` (default). Caller's JWT is forwarded to the Supabase client so RLS still applies to writes.
- Service role is used only for the `sync_outbox` upsert (audit row), never for the entity write itself.

**Failure handling**
- Network error → keep `pending`, increment `retries`, backoff (5s → 30s → 2min → 10min, capped).
- 4xx validation error → mark `failed`, surface in dashboard with the server's error message.
- 409 conflict → mark `conflict`, write `sync_conflicts`, surface in dashboard.

**i18n (EN/UR/AR)**
- All sync UI strings added to existing translation files. RTL handled via the project's `flex-row-reverse` pattern.

### Out of scope for this chunk
- The CoW field workflow UI itself (Chunk 3).
- Server-to-client push of new records to offline devices (deferred until Chunk 3 needs it; can use Supabase realtime or a pull-on-reconnect pattern then).
- Background sync via Service Worker (initial version uses in-page interval; SW upgrade is Chunk 7 alongside the Capacitor app).

### Files to add
- `src/lib/offline-sync/db.ts`
- `src/lib/offline-sync/outbox.ts`
- `src/lib/offline-sync/sync-engine.ts`
- `src/lib/offline-sync/types.ts`
- `src/hooks/useOfflineSync.ts`
- `src/components/offline/OfflineIndicator.tsx`
- `src/pages/app/sync/SyncDashboardPage.tsx`
- `src/pages/app/sync/ConflictDetailDialog.tsx`
- `supabase/functions/cow-sync/index.ts`

### Files to edit
- `src/App.tsx` — add `/app/sync` route, mount `OfflineIndicator` in header.
- `package.json` — add `dexie` and `dexie-react-hooks`.

### Exit criteria
- Disconnect network, create a mobile visit via a smoke-test screen → row appears in IndexedDB outbox immediately.
- Reconnect → row disappears from outbox, appears in `mobile_visits` server-side, indicator shows "synced".
- Re-submit the same `client_uuid` twice → exactly one server row.
- Edit the same record server-side then re-sync from another device → conflict appears in `/app/sync`, both resolution paths work.

Reply approve and I'll build it.

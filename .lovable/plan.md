# Self-Host HealthOS 24 — Migrate Supabase → NestJS + Prisma + PostgreSQL on VPS

## Goal

Move HealthOS off Supabase (managed) onto a self-hosted stack you fully own:
- **API**: NestJS (TypeScript, modular)
- **ORM**: Prisma
- **DB**: PostgreSQL 15 (self-hosted) with RLS policies preserved
- **Auth**: Custom JWT + bcrypt (access + refresh tokens, MFA-ready)
- **Authorization**: Postgres RLS (kept) + NestJS Guards (defense-in-depth)
- **Hosting**: Single VPS (Hetzner CX32 or DO 4GB minimum), Docker Compose
- **Frontend**: same React/Vite app, only the data layer swapped

No frontend features change. No database data is lost. Migration is done in a parallel repo so the live Lovable app keeps running until cutover.

---

## Scope reality check

HealthOS today has:
- **300+ tables**, ~700 RLS policies, ~100+ DB functions/triggers, ~40 edge functions
- **Frontend**: ~500 hooks/components using `supabase.from(...)`, `supabase.auth`, `supabase.functions.invoke`, `supabase.storage`, `supabase.channel` (Realtime)
- **Integrations**: NPHIES, ZATCA, HESN, Tatmeen, Nafath, Sehhaty, Wasfaty, WhatsApp, SMS, push, PACS, biometric devices

This is a **3–6 month migration for one engineer**, or **6–10 weeks with a small team**. The plan below is the roadmap, not something one AI turn can produce.

---

## Architecture (target state)

```text
                ┌─────────────────────────────┐
Browser ──────► │  Nginx (TLS, gzip, rate)    │
                └──────────────┬──────────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
          ┌───────▼────────┐        ┌──────▼──────┐
          │ NestJS API     │        │ Static SPA  │
          │ (Node 20)      │        │ (Vite build)│
          └───────┬────────┘        └─────────────┘
                  │
        ┌─────────┼──────────┬──────────────┐
        │         │          │              │
    ┌───▼───┐ ┌──▼───┐  ┌───▼────┐   ┌─────▼─────┐
    │ Postgres│ Redis│  │ MinIO  │   │ BullMQ    │
    │  + RLS  │(cache│  │(S3 API │   │ workers   │
    │         │/sess)│  │ files) │   │(cron/jobs)│
    └─────────┘└──────┘  └────────┘   └───────────┘
```

All of this runs on **one VPS via `docker-compose.yml`** initially. Split later if load demands.

---

## Migration phases

### Phase 0 — Prep (1 week)
- Provision VPS (Ubuntu 22.04, Docker, ufw, fail2ban, automated backups to S3/B2).
- Freeze schema changes on Supabase for the migration window.
- Full `pg_dump` of Supabase DB (schema + data + policies + functions + triggers).
- Set up new Git repo `healthos-api` (NestJS monorepo: `apps/api`, `apps/worker`, `packages/db`).

### Phase 1 — Database port (1–2 weeks)
- Restore `pg_dump` into self-hosted Postgres. Verify all 300+ tables, 700 policies, 100+ functions land intact.
- Replace Supabase-specific bits:
  - `auth.users` → `public.users` table (id, email, password_hash, mfa_secret, created_at…). Rewrite FKs from `auth.users(id)` to `public.users(id)`.
  - `auth.uid()` → custom `public.current_user_id()` returning `current_setting('app.current_user_id')::uuid`.
  - `auth.jwt()` → `public.current_jwt_claims()` returning `current_setting('app.jwt_claims')::jsonb`.
  - Storage buckets → MinIO (S3-compatible), keep same bucket names.
- Introspect with `prisma db pull` → get `schema.prisma` for all 300+ tables. Do NOT let Prisma manage migrations of existing tables; use `prisma migrate resolve` to baseline.
- Keep future schema changes in raw SQL migrations (matches current Supabase workflow); Prisma re-pulls after.

### Phase 2 — NestJS API skeleton (1 week)
- Modules mirror frontend domains: `auth`, `patients`, `opd`, `ipd`, `ot`, `lab`, `radiology`, `pharmacy`, `warehouse`, `hr`, `finance`, `billing`, `insurance`, `admin`, `portal`, `kiosk`.
- Global middleware: JWT verify → set `app.current_user_id` and `app.jwt_claims` on the DB session via a Prisma extension (`$use` middleware) so **RLS policies keep working unchanged**.
- Guards: `JwtAuthGuard`, `RolesGuard` (reads `user_roles` table, mirrors `has_role()` SECURITY DEFINER function), `OrgScopeGuard`.
- DTOs + `class-validator` for input validation (mirrors current Zod usage in edge functions).
- OpenAPI/Swagger auto-generated at `/api/docs`.

### Phase 3 — Auth module (1 week)
- `POST /auth/signup`, `/login`, `/refresh`, `/logout`, `/forgot-password`, `/reset-password`.
- Access token (15 min JWT) + refresh token (30 days, httpOnly cookie, rotated on use, stored hashed in `refresh_tokens` table).
- bcrypt (cost 12) for passwords.
- MFA: TOTP via `otplib`, recovery codes reuse existing `user_mfa_recovery_codes` table.
- Password reset via signed token emailed through existing SMTP config.
- **Password migration**: Supabase uses bcrypt too — export `auth.users.encrypted_password` and copy directly into `public.users.password_hash`. Users keep their existing passwords.

### Phase 4 — Port edge functions → NestJS controllers/services (2–3 weeks)
Each of the ~40 edge functions becomes a service method + controller route. Same input/output shape so frontend `supabase.functions.invoke('x', {body})` becomes `apiClient.post('/x', body)` with a single adapter.

Priority order: `payment-*`, `zatca-einvoice`, `nphies-*`, `hesn-gateway`, `nafath-gateway`, `tatmeen-gateway`, `sehhaty-gateway`, `wasfaty-gateway`, `whatsapp-dispatch`, `send-sms`, `send-push-notification`, `mfa-*`, `pacs-settings`, `test-email-config`, `data-retention-purge`, `cow-sync`, `health`, `heygen-token`.

Cron jobs (data-retention-purge, cow-sync, IPD daily charges) → BullMQ + Redis with `@nestjs/schedule`.

### Phase 5 — Realtime replacement (3–4 days)
Supabase Realtime (Postgres logical replication → WebSocket) is used in ~15 places (lab orders, IPD beds, notifications, queue displays, etc.).

Options in NestJS:
- **Socket.io gateway** + Postgres `LISTEN/NOTIFY` triggers on the same tables → emit to rooms scoped by `organization_id`.
- Keep the frontend `supabase.channel(...)` API surface via a thin `realtimeClient` wrapper so hooks don't change.

### Phase 6 — Storage (2 days)
- Deploy MinIO in the compose stack. Same bucket layout as Supabase Storage.
- Migrate objects with `rclone` (Supabase Storage → MinIO).
- Replace `supabase.storage.from(...).upload/download/createSignedUrl` with a `storageClient` wrapper hitting NestJS `/storage/*` (which proxies to MinIO with signed URLs).

### Phase 7 — Frontend adapter (1–2 weeks)
Do NOT rewrite 500 hooks. Instead, replace `src/integrations/supabase/client.ts` with a **compat shim** exposing the same API:

```ts
// Same import path, same signatures — hooks don't change
export const supabase = {
  from: (table) => new QueryBuilder(table, apiClient),   // maps .select/.eq/.insert/.update → REST
  auth:   authAdapter,                                   // login/signup/session
  functions: { invoke: (name, opts) => apiClient.post(`/fn/${name}`, opts.body) },
  storage: storageAdapter,
  channel: realtimeAdapter,                              // socket.io under the hood
};
```

The shim covers ~95% of usage. Remaining 5% (edge cases like `.rpc()`, `.throwOnError()`, PostgREST embeds) get migrated file-by-file. `types.ts` is regenerated from Prisma.

### Phase 8 — Cutover (1 week)
1. Final `pg_dump` from Supabase during a maintenance window (est. 2–4 h).
2. Restore into self-hosted Postgres.
3. Sync MinIO one last time (`rclone sync`).
4. Point DNS (`healthos24.com`) to the VPS Nginx.
5. Monitor for 72 h; keep Supabase project read-only as rollback for 30 days.

### Phase 9 — Observability & ops (ongoing)
- Logs: Pino → Loki or plain files rotated by logrotate.
- Metrics: Prometheus + Grafana (Node exporter, Postgres exporter, NestJS custom metrics).
- Errors: Self-hosted Sentry or GlitchTip.
- Backups: `pg_dump` nightly + WAL archiving to B2/S3; MinIO versioning on.
- Uptime: UptimeKuma.

---

## Technical details

**Prisma + RLS interaction**: Prisma opens pooled connections. RLS needs per-request `SET app.current_user_id`. Use a Prisma client extension that runs `SET LOCAL` inside a transaction wrapper for every request, OR use `pg` directly and pass Prisma the same connection via `$transaction`. Alternative: use `@nestjs-cls/transactional` + `pg-boss` pattern. This is the single trickiest technical piece — must be nailed in Phase 2.

**Connection pooling**: PgBouncer in transaction mode in front of Postgres. Prisma configured with `pgbouncer=true`.

**Compose services**: `nginx`, `api` (NestJS), `worker` (NestJS worker mode for cron/queues), `postgres`, `pgbouncer`, `redis`, `minio`, `backup` (cron container running `pg_dump` + `rclone`).

**Environment**: `.env` for local, Docker secrets or SOPS-encrypted files for VPS.

**CI/CD**: GitHub Actions → build image → push to GHCR → SSH deploy → `docker compose pull && up -d --no-deps api worker`.

**KSA data residency**: pick a VPS region compliant with your regulator requirement (Hetzner has no KSA region; consider AWS Bahrain `me-south-1` or STC Cloud if HESN/NPHIES requires in-kingdom hosting).

---

## What I can deliver in this project (Lovable app)

Lovable's sandbox is React/Vite frontend + Supabase — it **cannot host or run** the NestJS backend. What I *can* do here, once you approve:

1. **Generate a starter `healthos-api` scaffold** as a downloadable folder under `/mnt/documents/healthos-api/`:
   - NestJS project with the module structure above
   - `docker-compose.yml`, `Dockerfile`, `nginx.conf`
   - `schema.prisma` introspected from your current DB
   - Auth module (JWT + bcrypt + MFA) fully implemented
   - RLS middleware wired up
   - One example domain module end-to-end (patients) as the template
   - README with step-by-step VPS setup
2. **Build the frontend compat shim** (`src/integrations/supabase/client.ts` replacement) inside *this* Lovable project, gated behind an env flag so it only activates when you set `VITE_API_MODE=self-hosted`. Supabase stays default until you're ready.
3. **Port edge functions**: I'll translate them one by one into NestJS controllers you drop into the new repo. Deliverables per function: controller, service, DTO, unit tests.

What you'll do outside Lovable:
- Provision the VPS
- Run `pg_dump` / `pg_restore` for data migration
- Run `rclone` for storage migration
- Point DNS
- Own the ops from there

---

## Out of scope for this migration

- No feature rewrites — behavior stays identical.
- No move to microservices — monolith NestJS is right for this size.
- No mobile app changes (Capacitor build already points at the same API).
- Urdu/Arabic/English UI already exists; no i18n work needed.

---

## Deliverable of the FIRST approval

If you say "go", I'll produce in the next turn:
1. `/mnt/documents/healthos-api/` starter scaffold (Phases 0–3 skeleton, ~40 files)
2. A `MIGRATION.md` runbook with the exact commands for VPS setup, `pg_dump`, Prisma introspection, first deploy
3. A compat-shim proposal PR in this project (behind `VITE_API_MODE` flag, no breaking change)

Then we iterate phase by phase. Confirm to proceed, or tell me which phase to tackle first if you want a different order.

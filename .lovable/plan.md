## Go-Live Sequenced Plan (D — All Three)

Three phases, executed in order. Each phase ends in a verifiable gate before the next begins.

---

### Phase A — Linter Triage (security closure)

**Current state:** 32 linter findings — 1 INFO (RLS no policy), 30 WARN (`SECURITY DEFINER` functions executable by `anon` or `authenticated`), 1 WARN (leaked-password protection off).

**Goal:** Reduce DEFINER warnings from 30 to only the documented intentional set in `mem://security/intentional-definer-grants`.

**Steps:**
1. Pull every flagged function with `pg_get_functiondef` and group into 3 buckets:
   - **Revoke from anon** — utility functions (e.g. trigger helpers, internal calculators) that should never be called over the API. Migration: `REVOKE EXECUTE ... FROM anon;`
   - **Revoke from authenticated** — functions only meant to be called by triggers/cron. Migration: `REVOKE EXECUTE ... FROM authenticated;`
   - **Keep + document** — kiosk/QR/MFA helpers that legitimately need `anon` execute. Add the function name to `mem://security/intentional-definer-grants` and to a SQL comment on the function.
2. Fix the 1 INFO finding: locate the table with RLS-enabled-no-policy and either add a `FOR ALL USING (false)` deny-by-default policy or remove RLS if the table is public reference data.
3. Re-run `supabase--linter`; target outcome ≤ documented allowlist (~5 functions).
4. Manually toggle leaked-password protection in Supabase Auth (the only remaining warning becomes a checklist item, not a code change).

**Gate:** Linter shows only allowlisted DEFINER functions remaining; `SecuritySetupPage` checklist updated.

---

### Phase B — CI Workflow (regression safety net)

**Goal:** Every PR runs the critical-path E2E suite + linter automatically, so production-readiness can't regress.

**Steps:**
1. Add `.github/workflows/ci.yml` with three jobs:
   - **lint-and-typecheck** — `npm ci`, `npm run lint`, `tsc --noEmit`
   - **unit-tests** — `npx vitest run`
   - **e2e-critical** — `npx playwright install --with-deps chromium`, then `npm run test:e2e:critical` against a built preview (`npm run build && npm run preview`)
2. Add `.github/workflows/supabase-linter.yml` (nightly + on migration PRs) using the Supabase CLI `db lint` against the staging branch; fail on new ERROR-level findings.
3. Add `playwright.config.ts` CI override: when `process.env.CI === 'true'`, drop the Nix `executablePath` so Playwright uses its own bundled browser (the Nix path only exists in the sandbox).
4. Upload Playwright HTML report + trace as artifacts on failure for fast triage.
5. Add a `README.md` "CI status" badge section.

**Gate:** Open a no-op PR; all three jobs pass green within ~8 minutes.

---

### Phase C — i18n Audit (UR/AR parity)

**Current state:** `en.ts` has 4,318 lines vs `ar.ts` and `ur.ts` at 4,224 each — ~94 keys missing in non-English. New admin/security pages (`SecuritySetupPage`, MFA enrollment, runbooks, integration health, error monitoring) appear to use hardcoded English strings.

**Goal:** Per project rule "Build everything in 3 languages" — every user-visible string resolves in en/ar/ur.

**Steps:**
1. **Diff the dictionaries** — script that prints keys in `en.ts` not present in `ar.ts`/`ur.ts`. Add the ~94 missing entries with proper translations.
2. **Audit recent admin pages** for hardcoded strings:
   - `src/pages/app/admin/SecuritySetupPage.tsx`
   - `src/pages/app/admin/RunbooksPage.tsx`, `IntegrationHealthPage.tsx` (if present)
   - `src/components/mfa/EnrollMFADialog.tsx`, `MFAVerifyPage.tsx`
   - `src/components/IdleTimeoutDialog.tsx`
   - Replace literals with `t('key.path')` from `useTranslation()`.
3. **Add new translation keys** for the strings introduced in Phase A/B (security setup steps, CI status messages, error monitoring labels) into all three files in lock-step.
4. **RTL spot-check** — load each new page with `default_language='ar'` and verify layout via the `useIsRTL` hook + existing `flex-row-reverse` patterns (per `mem://ui/rtl-sidebar-direction`).
5. Add an ESLint custom rule or simple grep CI check that flags new hardcoded JSX strings in `src/pages/app/admin/**` to prevent regression.

**Gate:** `wc -l` on the three translation files matches; admin pages render correctly in ar/ur with no English bleed-through.

---

### Out of scope (tracked, not done in this pass)

- Disaster-recovery restore drill (manual ops task — documented in runbooks)
- Load testing (separate effort, needs k6 or Artillery setup)
- Automated alerting beyond DB logging (needs PagerDuty/Slack webhook decision from user)
- ZATCA/NPHIES sandbox certification (external regulatory submissions)

---

### Execution order & estimate

| Phase | Effort | Blocks production? |
|-------|--------|--------------------|
| A. Linter triage | ~1 migration + memory update | Yes — security baseline |
| B. CI workflow | 2 workflow files + config tweak | Yes — regression safety |
| C. i18n audit | ~94 keys + 5–8 page edits | Yes — project rule |

After all three phases pass their gates, the system is production-ready pending the three external/manual items above.

Approve to proceed with **Phase A** first; B and C will follow in subsequent turns so you can review each gate.
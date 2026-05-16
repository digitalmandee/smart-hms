# Pilot Rollout Playbook — Wave 1

**Target pilot:** 1 hospital (≤120 beds) + 5 Clinic-on-Wheels vans, KSA region.
**Duration:** 6 weeks (2 onboarding · 4 supervised production).
**Owner:** Implementation Lead · **Escalation:** CTO

---

## 1. Pre-flight (Week −2)

| # | Task | Owner | Done when |
|---|---|---|---|
| 1 | Sign BAA + Data-Processing Agreement | Legal | PDF in `docs/legal/` |
| 2 | Provision tenant + facility records | Implementation | Org appears in `organizations` |
| 3 | Load Chart of Accounts (KSA template) | Finance | `accounts` count > 80 |
| 4 | Import staff roster + roles | HR | All users can log in |
| 5 | Configure NPHIES + Sehhaty sandbox keys | Integrations | `/app/integrations/health-network` green |
| 6 | Configure HyperPay + STC Pay live keys | Finance | Test SAR 1 charge clears |
| 7 | Run k6 load test against staging | DevOps | p95 < 800 ms |
| 8 | Run security scan + RLS audit | Security | 0 critical findings |
| 9 | Print fallback paper forms (OPD, IPD, Rx) | Ops | Stock at each station |

## 2. Training (Week −1)

| Audience | Module(s) | Duration | Format |
|---|---|---|---|
| Receptionists | OPD walk-in, billing sessions, token queue | 4 h | In-person + video |
| Nurses | Vitals, IPD charting, medication admin | 6 h | In-person |
| Doctors | Consultation, e-prescribing, lab/imaging orders | 3 h | In-person |
| Lab/Radiology techs | Specimen workflow, result reporting | 3 h | In-person |
| Pharmacists | POS, dispensing, Wasfaty | 3 h | In-person |
| CoW van crews | Offline mode, mobile units, sync indicator | 4 h | Ride-along |
| Finance | Daily closing, vouchers, ZATCA invoicing | 6 h | Workshop |
| Admin / IT | User mgmt, audit logs, security scan | 2 h | Workshop |

**Training assets** (record once, reuse):
- `videos/01-opd-walkin.mp4`
- `videos/02-ipd-admission.mp4`
- `videos/03-cow-offline-sync.mp4`
- `videos/04-pharmacy-pos.mp4`
- `videos/05-daily-closing.mp4`
- `videos/06-patient-portal.mp4`

## 3. Go-live (Week 1)

**Day 0 — Friday evening**
1. Switch DNS / publish app
2. Smoke test: register 1 patient, complete 1 OPD visit end-to-end (consult → lab → pharmacy → pay)
3. Verify ZATCA invoice clears Phase 2 validation
4. Verify CoW van #1 syncs from airplane mode

**Day 1–3 — On-site support**
- 2 implementation engineers on the floor 07:00–22:00
- Floor-walks every 2 h; log issues in shared sheet
- Daily 18:00 huddle with hospital ops manager

**Day 4–14 — Hyper-care**
- 1 engineer on-site, 1 remote
- Daily ops huddle, weekly steering committee
- Tag every incident `pilot/hyper-care` in issue tracker

## 4. Success metrics (review weekly)

| Metric | Target | Source |
|---|---|---|
| OPD registration time | < 90 s | `opd_visits.created_at − patient_search_at` |
| Avg consultation to dispense | < 25 min | invoice timestamps |
| Daily closing reconciled | 100 % | `daily_closing_reconciliations` |
| Portal active patients | ≥ 30 % of registered | `patient_portal_accounts.last_login_at` |
| CoW van sync success | ≥ 99.5 % | `sync_outbox` retry rate |
| NPHIES claim acceptance | ≥ 90 % | `nphies_claims.status` |
| Sev-1 incidents | 0 / week | escalation log |

## 5. Escalation matrix

| Severity | Examples | First response | Resolve by | Channel |
|---|---|---|---|---|
| **Sev 1** | Auth down, billing blocked, data loss | 15 min | 4 h | Phone + WhatsApp war-room |
| **Sev 2** | Module unusable for one role | 1 h | 1 business day | WhatsApp group |
| **Sev 3** | Workflow degraded, workaround exists | 4 h | 3 business days | Ticket |
| **Sev 4** | Cosmetic / feature request | 1 business day | Next sprint | Ticket |

**Contacts**
- Hospital ops manager — `<name>` `<phone>`
- Implementation Lead — `<name>` `<phone>`
- On-call engineer (24×7) — `<rotating>` `<pager>`
- CTO (Sev 1 only) — `<name>` `<phone>`

## 6. Rollback plan

If Sev 1 unresolved at 4 h:
1. Switch reception + billing to paper forms (step 1.9)
2. Lock writes via feature flag `pilot_readonly = true`
3. Capture state with `pg_dump` snapshot
4. Patch → restore → catch-up entry via bulk import script

## 7. Exit criteria (end of Week 6)

- [ ] 4 consecutive weeks zero Sev 1
- [ ] All success metrics green for 2 consecutive weeks
- [ ] Hospital signs sign-off form
- [ ] Knowledge transfer to in-house IT complete
- [ ] Wave 2 backlog prioritised with pilot learnings

- Donation category = `financial_donations.purpose`; fund spending on patient bills is recorded only in `fund_utilizations`, whose trigger posts the GL and updates invoice paid amounts — keeps fund balances and ledger in one source.
- Hidden modules are controlled centrally by `GLOBALLY_HIDDEN_PREFIXES`/names in `src/lib/facility-type-filter.ts` (static and DB menus) — so features can be re-enabled without deleting code.

- Patient portal logins are created/reset/disabled only via the `portal-account-manage` edge function (staff roles checked server-side); patient data access goes through `user_owns_patient()`, which requires an active portal account — keeps portal access revocable in one place.

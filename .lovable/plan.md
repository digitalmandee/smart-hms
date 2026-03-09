
Goal: run the full smoke E2E suite now and verify all configured modules pass.

What I verified in codebase:
- `package.json` already has `test:e2e: playwright test`.
- `playwright.config.ts` points to `tests/e2e`, base URL `http://localhost:8080`, and auto-starts Vite with `npm run dev`.
- Smoke specs exist for all expected modules:
  - `auth-redirect`, `documentation`
  - `opd`, `ipd`, `lab`, `radiology`
  - `pharmacy`, `warehouse`, `finance`
- Role login helper exists at `tests/e2e/utils/demoLogin.ts` (includes unlock flow).

Execution plan (full suite):
1. Install deps (if not already installed): `npm install`
2. Run smoke tests: `npm run test:e2e`
3. If failures occur, rerun in debug mode:
   - headed: `npx playwright test --headed`
   - single failing file: `npx playwright test tests/e2e/<failed-file>.spec.ts --headed`
4. Open HTML report after run: `npx playwright show-report`

Pass criteria:
- All smoke specs pass.
- No module route smoke check fails for: OPD, IPD, Lab, Radiology, Pharmacy, Warehouse, Finance, Documentation, Auth redirect.

If you want, next step after this plan approval is I’ll proceed with a failure-triage plan template (fast isolate -> locator fix -> rerun impacted specs -> full rerun) so any red tests can be fixed quickly.

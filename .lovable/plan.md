# Align Privacy Policy, Terms & Legal Pages

## Problem

- Footer links for Privacy Policy, Terms of Service, HIPAA Compliance, and Security all point to `#` (dead).
- Signup page links to `/terms` and `/privacy`, but neither route exists → 404.
- No public legal content exists for HealthOS 24.

## What I'll build

### 1. Four new public pages

All under a shared `LegalLayout` (uses `Navbar` + `Footer`, prose styling, last-updated date, table of contents on desktop).

| Route | Page | Content |
|---|---|---|
| `/privacy` | Privacy Policy | Data collected (account, PHI, billing, device/log), legal bases, sharing, retention, security, international transfers, user rights (HIPAA, KSA PDPL, GDPR), cookies, contact |
| `/terms` | Terms of Service | Acceptance, account/eligibility, subscription & billing, acceptable use, data ownership, IP, warranty disclaimer, liability cap, termination, governing law, contact |
| `/hipaa` | HIPAA Compliance | Covered entity vs BA role, safeguards (administrative/physical/technical), PHI handling, breach notification, BAA availability, patient rights |
| `/security` | Security Overview | Encryption (TLS 1.3 / AES-256), RLS, MFA, session timeouts, audit logging, backups, vulnerability disclosure, certifications-in-progress |

Drafted as standard SaaS + healthcare template — placeholder for legal entity to be confirmed (memo: user said "health os 24 name yes"; I'll use **"HealthOS 24"** as the entity name and `support@healthos24.com` / `legal@healthos24.com` as contacts; both editable in one constants file).

### 2. Tri-lingual content (EN / UR / AR)

- Add translation keys under `src/lib/i18n/` for each page (sections, headings, body paragraphs).
- Arabic pages render RTL using the existing `flex-row-reverse` / `text-end` pattern (per project core rule).
- Language switching uses the existing `useTranslation` hook — no new infra.

### 3. Wire-up

- `src/App.tsx`: add 4 routes with `<SEO>` tags (title + description + canonical per page).
- `src/components/landing/Footer.tsx`: replace `#` with `/privacy`, `/terms`, `/hipaa`, `/security` (use `<Link>`, not `<a>`).
- `src/pages/auth/SignupPage.tsx`: links already correct — just verify they resolve.
- `public/sitemap.xml`: add the 4 new URLs.

### 4. Out of scope

- Real legal review (template is a starting point; user should have counsel review before public launch).
- Cookie consent banner (separate feature).
- Per-tenant custom legal pages (single global set for HealthOS 24 itself).

## Technical notes

- **Files created**: `src/pages/legal/PrivacyPolicyPage.tsx`, `TermsOfServicePage.tsx`, `HipaaCompliancePage.tsx`, `SecurityOverviewPage.tsx`, `src/components/legal/LegalLayout.tsx`, `src/lib/legal-constants.ts` (entity name, emails, last-updated dates).
- **i18n**: extend existing namespaced JSON files for `en`, `ur`, `ar` with a `legal.*` namespace.
- **SEO**: each page gets unique `<title>` (≤60 chars) and `<meta name="description">` (≤160 chars) via the existing `<SEO>` component.
- **No DB / no backend changes.**

## Structure

```text
src/
  pages/legal/
    PrivacyPolicyPage.tsx
    TermsOfServicePage.tsx
    HipaaCompliancePage.tsx
    SecurityOverviewPage.tsx
  components/legal/
    LegalLayout.tsx
    LegalSection.tsx
  lib/
    legal-constants.ts
    i18n/legal.en.ts
    i18n/legal.ur.ts
    i18n/legal.ar.ts
```

Approve and I'll implement.

## Goal

Add a new `/blog` section to HealthOS 24 with **20 long-form, SEO-optimized articles** targeting hospital management, KSA compliance, EMR, pharmacy and clinical workflow keywords. Articles are searchable on-site, individually indexable by Google, and listed in the sitemap.

## What gets built

### 1. Blog data layer
- `src/content/blog/posts.ts` — typed array of 20 `BlogPost` objects: `slug, title, description, keywords[], category, author, publishedAt, readingMinutes, heroAlt, content (MDX-like sections)`.
- Content authored as structured sections (`{ heading, body }[]`) so we can render semantic `<h2>/<p>` without an MDX runtime.

### 2. Routes (added to `src/App.tsx`)
- `/blog` → `BlogIndex.tsx` — searchable list of all 20 posts.
- `/blog/:slug` → `BlogPost.tsx` — single article with Article JSON-LD + BreadcrumbList JSON-LD.

### 3. Pages
- **BlogIndex**: hero, search input (client-side fuzzy match on title + description + keywords + category), category filter chips, responsive card grid. Each card → `/blog/:slug`.
- **BlogPost**: breadcrumbs, H1, meta line (date · reading time · category), prose body, related posts (3 from same category), CTA back to product.

### 4. SEO per article
- Reuses the existing `<SEO>` component (already used across other public routes) with unique `title`, `description`, `path`.
- Adds `Article` + `BreadcrumbList` JSON-LD inline in BlogPost via a tiny `<script type="application/ld+json">` block (no new dependency — Helmet not required since `<SEO>` already handles head tags).
- `og:type=article`, `article:published_time`, `article:section` set per post.

### 5. Sitemap
- Update `scripts/generate-sitemap.ts`:
  - Add static `/blog` entry (weekly, 0.8).
  - Loop the imported `posts` array → one entry per `/blog/:slug` (monthly, 0.7, lastmod = `publishedAt`).
- Regenerate `public/sitemap.xml` via the existing predev hook.

### 6. Discoverability
- Add a "Blog" link to the public navigation/footer on `Index.tsx` so the index page links to `/blog` (helps crawl depth).
- Internal cross-links: each article links to 2 related product pages (e.g. `/pharmacy-documentation`, `/ksa-documentation`) to spread link equity.

## The 20 articles (titles + target keyword)

Grouped by cluster — covers HMS, KSA compliance, pharmacy, clinical, finance/HR. All English.

**Hospital Management System (HMS / EMR)**
1. What Is a Hospital Management System? A Complete 2026 Guide — *hospital management system*
2. HMS vs EMR vs EHR: Differences Hospitals Actually Care About — *hms vs emr*
3. 12 Must-Have Features in Modern Hospital Software — *hospital software features*
4. Cloud HMS vs On-Premise: Cost, Security & Scale Compared — *cloud hospital management system*
5. How to Choose an HMS for a Multi-Branch Hospital — *multi branch hospital software*

**Saudi Arabia / KSA Compliance**
6. NPHIES Integration Explained for Saudi Hospitals — *nphies integration*
7. ZATCA Phase 2 E-Invoicing for Healthcare Providers — *zatca e-invoicing healthcare*
8. Wasfaty E-Prescription: A Practical Implementation Guide — *wasfaty integration*
9. Nafath & Sehhaty: Patient Identity in Saudi Clinics — *nafath integration healthcare*
10. CBAHI Accreditation: How HMS Helps You Pass — *cbahi accreditation software*

**Pharmacy & Inventory**
11. Pharmacy Inventory Management: FIFO, Expiry & Reorder Levels — *pharmacy inventory management*
12. Reducing Medication Errors with Barcode Dispensing — *barcode medication dispensing*
13. GRN to GL: How Pharmacy Stock Posts to Accounting — *grn accounting workflow*

**OPD / IPD / Clinical**
14. OPD Token Queue Systems That Actually Reduce Wait Times — *opd queue management*
15. IPD Discharge Workflow: A Step-by-Step Checklist — *ipd discharge process*
16. Lab Order to Result: Reducing Turnaround Time — *lab turnaround time*
17. Radiology Reporting Workflows for Faster Verification — *radiology reporting workflow*

**Finance & HR**
18. Hospital Revenue Cycle Management Best Practices — *hospital revenue cycle management*
19. Doctor Earnings & Commission Models in Hospitals — *doctor commission software*
20. Saudi Labor Law: Gratuity Calculation for Healthcare Staff — *saudi gratuity calculation*

Each article: ~800–1,200 words, 4–6 H2 sections, intro, conclusion with CTA, FAQ block where relevant.

## Out of scope

- Arabic/Urdu translations (deferred per user choice).
- CMS-backed authoring (content stays in code; cheap to add later).
- Comments, likes, author profiles.
- Newsletter signup.

## Technical notes

- No new dependencies. Search uses a simple `toLowerCase().includes()` filter; sufficient at 20 posts.
- BlogPost renders raw structured content — no `dangerouslySetInnerHTML`, no MDX runtime, no markdown parser.
- Routes added to the public `<Route>` block in `src/App.tsx`, lazy-loaded with `React.Suspense` to match neighbors.
- Sitemap script imports `posts` from `src/content/blog/posts.ts` directly (already runs under `tsx`).
- Canonical for each post: `https://healthos24.com/blog/{slug}` (matches the primary verified custom domain).

## File touch list

```text
src/content/blog/posts.ts          (new — 20 entries)
src/pages/BlogIndex.tsx            (new)
src/pages/BlogPost.tsx             (new)
src/App.tsx                        (add 2 routes)
src/pages/Index.tsx                (add Blog nav link)
scripts/generate-sitemap.ts        (append /blog + per-post entries)
public/sitemap.xml                 (regenerated)
```

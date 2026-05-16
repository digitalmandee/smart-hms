// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";
import { posts } from "../src/content/blog/posts";

const BASE_URL = "https://healthos24.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// Only public, indexable marketing/docs routes. App (/app/*) and auth routes are gated and excluded.
const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/presentation", changefreq: "monthly", priority: "0.6" },
  { path: "/executive-presentation", changefreq: "monthly", priority: "0.6" },
  { path: "/pharmacy-warehouse-presentation", changefreq: "monthly", priority: "0.5" },
  { path: "/pricing-proposal", changefreq: "monthly", priority: "0.7" },
  { path: "/contract", changefreq: "monthly", priority: "0.4" },
  { path: "/social-media-posts", changefreq: "monthly", priority: "0.4" },
  { path: "/documentation", changefreq: "weekly", priority: "0.8" },
  { path: "/pharmacy-documentation", changefreq: "monthly", priority: "0.6" },
  { path: "/finance-demo-guide", changefreq: "monthly", priority: "0.5" },
  { path: "/opd-documentation", changefreq: "monthly", priority: "0.5" },
  { path: "/ipd-documentation", changefreq: "monthly", priority: "0.5" },
  { path: "/ot-documentation", changefreq: "monthly", priority: "0.5" },
  { path: "/lab-documentation", changefreq: "monthly", priority: "0.5" },
  { path: "/radiology-documentation", changefreq: "monthly", priority: "0.5" },
  { path: "/warehouse-documentation", changefreq: "monthly", priority: "0.5" },
  { path: "/finance-documentation", changefreq: "monthly", priority: "0.5" },
  { path: "/hr-documentation", changefreq: "monthly", priority: "0.5" },
  { path: "/dialysis-documentation", changefreq: "monthly", priority: "0.5" },
  { path: "/dental-documentation", changefreq: "monthly", priority: "0.5" },
  { path: "/ksa-documentation", changefreq: "monthly", priority: "0.5" },
  { path: "/demo-faq-documentation", changefreq: "monthly", priority: "0.5" },
  { path: "/system-overview", changefreq: "monthly", priority: "0.5" },
];

const today = new Date().toISOString().slice(0, 10);

function generateSitemap(items: SitemapEntry[]) {
  const urls = items.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ].filter(Boolean).join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);

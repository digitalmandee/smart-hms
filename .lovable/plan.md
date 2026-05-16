## Problem

Google shows the old Lovable favicon for healthos24.com. Root cause: `public/favicon.ico` (the Lovable default) is still served at `/favicon.ico`, which Googlebot requests by default and prefers over the PNG declared in `index.html`. The current `<link rel="icon">` only points to `/favicon.png` — no `.ico` override, so Google falls back to the stale Lovable `.ico`.

## Fix

1. Replace `public/favicon.ico` with the HealthOS 24 icon (convert the existing `public/favicon.png` to a multi-size `.ico`: 16, 32, 48). This guarantees `/favicon.ico` serves the correct brand mark for any crawler/browser that requests it directly.
2. Add a multi-size favicon link set in `index.html`:
   - `<link rel="icon" type="image/x-icon" href="/favicon.ico" />`
   - keep `<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />`
   - `<link rel="apple-touch-icon" href="/favicon.png" />`
3. Publish the frontend so the new `/favicon.ico` is live.
4. Request Google to refresh: in Search Console, use URL Inspection on `https://healthos24.com/favicon.ico` → "Request Indexing". Favicon refresh in SERP can still take days/weeks — this is a Google-side cache, not something we control after the file is correct.

## Technical notes

- The favicon `.ico` will be generated from `public/favicon.png` using ImageMagick (`nix run nixpkgs#imagemagick -- convert favicon.png -define icon:auto-resize=16,32,48 favicon.ico`).
- No JSON-LD / OG / manifest changes needed — `logo` in the Organization schema already points to the brand PNG.
- No code changes outside `index.html` and `public/favicon.ico`.

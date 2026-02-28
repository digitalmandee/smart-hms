

# Add Downloadable HealthOS Logo PNG to System Overview

## Plan
Add a section at the top of the System Overview page with the HealthOS 24 logo rendered as an SVG, along with a "Download PNG" button that converts it to a PNG image using `html-to-image` (already installed) and triggers a download.

## Changes

### `src/pages/SystemOverview.tsx`
1. Import `useRef`, `useState`, `toPng` from `html-to-image`, `Download` and `Loader2` icons, and `HealthOS24Logo` component
2. Add a logo section after the header with:
   - The `HealthOS24Logo` rendered at `xl` size with tagline inside a ref'd container
   - A "Download Logo as PNG" button that uses `toPng()` to capture the logo container and trigger download
   - Clean white background with padding so the downloaded PNG looks professional


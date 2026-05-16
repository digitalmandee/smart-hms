# Native app icon + splash sources

Source assets consumed by `@capacitor/assets` to generate every Android and iOS
icon / splash density.

| File | Size | Purpose |
|---|---|---|
| `icon.png` | 1024×1024 | App icon (Play Store + iOS App Icon set) |
| `splash.png` | 1920×1920 (square) | Splash screen (centered logo on brand gradient) |

Brand colors (HealthOS24):
- Primary: `#0891b2` (cyan-600)
- Accent: `#06b6d4` (cyan-500) → `#0e7490` (cyan-700) gradient

## Regenerate native assets

Run **after** `npx cap add android` / `npx cap add ios` has created the native
platform folders:

```bash
npm run assets:generate
```

This invokes `npx capacitor-assets generate --iconBackgroundColor #0891b2 --splashBackgroundColor #0891b2`
and writes:
- `android/app/src/main/res/mipmap-*/ic_launcher*.png`
- `android/app/src/main/res/drawable*/splash.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/*.png`
- `ios/App/App/Assets.xcassets/Splash.imageset/*.png`

Commit the regenerated files alongside `resources/*` so subsequent
`npx cap sync` runs ship the branded assets.

## Replacing the artwork

Drop a new 1024×1024 `icon.png` and 1920×1920 square `splash.png` here, then
re-run the command above. No code changes needed.

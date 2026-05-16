# Mobile build (Capacitor)

The Lovable web bundle is wrapped as a native iOS/Android app via Capacitor.

## One-time setup (after exporting to GitHub)

```bash
git pull
npm install
npx cap add ios       # macOS + Xcode required
npx cap add android   # Android Studio required
```

## Build & run

```bash
npm run build                  # produces dist/
npx cap sync                   # copies web bundle into native shells
npx cap run ios                # launches iOS simulator / device
npx cap run android            # launches Android emulator / device
```

## Native capabilities wired in this chunk

| Feature                | Web fallback                     | Native plugin              |
|------------------------|----------------------------------|----------------------------|
| Push notifications     | `Notification` API               | `@capacitor/push-notifications` |
| Local notifications    | `Notification` API               | `@capacitor/local-notifications` |
| Geolocation            | `navigator.geolocation`          | `@capacitor/geolocation`   |
| Camera / photo         | `<input type="file" capture>`    | `@capacitor/camera`        |
| In-app browser (pay)   | `window.open`                    | `@capacitor/browser`       |
| Device identity        | `crypto.randomUUID` + UA         | `@capacitor/device`        |
| Network status         | `navigator.onLine`               | `@capacitor/network`       |
| Biometric              | WebAuthn platform authenticator  | (add `@aparajita/capacitor-biometric-auth` for true Face/Touch ID) |

All wrappers live in `src/lib/native/index.ts` and degrade gracefully in the
browser, so no UI changes are needed for the deployed web app.

## In-app payments

Use `openExternal(checkoutUrl)` from `src/lib/native`. It pops the in-app
Safari/Chrome Custom Tab on device and a normal new tab on web. The hosted
checkout (Stripe/Paddle/HBL) returns to a deep link configured in
`capacitor.config.ts` → `App.appUrlOpen` (handled by `@capacitor/app`).

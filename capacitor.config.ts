import type { CapacitorConfig } from '@capacitor/cli';

/**
 * PRODUCTION Capacitor config — loads the bundled `dist/` web assets from
 * inside the app. No remote URL is embedded, so the resulting APK / IPA
 * works fully offline once an auth session is cached.
 *
 * For hot-reload during development against the Lovable sandbox, copy
 * `capacitor.config.dev.ts` over this file before running `npx cap sync`
 * (or use `npm run cap:sync:dev`).
 */
const config: CapacitorConfig = {
  appId: 'app.lovable.0eeac6953ca245ba87e8f046d5957181',
  appName: 'HealthOS 24',
  webDir: 'dist',
  // NOTE: no `server.url` in production — bundle is loaded from `dist/`.
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: false, // manually hidden from boot orchestrator
      backgroundColor: '#0891b2',
      showSpinner: true,
      spinnerColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      // 'body' resizes the document so flex/scroll layouts stay intact when
      // the soft keyboard opens. 'native' caused the login form to collapse.
      resize: 'body',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0891b2',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#0891b2',
    },
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0891b2',
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0891b2',
    limitsNavigationsToAppBoundDomains: true,
  },
};

export default config;

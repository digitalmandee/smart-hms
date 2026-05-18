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
      launchShowDuration: 2500,
      launchAutoHide: false, // manually hidden by boot orchestrator after first paint
      launchFadeOutDuration: 250,
      backgroundColor: '#0891b2',
      showSpinner: true,
      spinnerColor: '#ffffff',
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      androidScaleType: 'CENTER_INSIDE',
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true,
      useDialog: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'light', // light icons on the dark cyan brand background
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

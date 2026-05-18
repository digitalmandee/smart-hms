import type { CapacitorConfig } from '@capacitor/cli';

/**
 * DEVELOPMENT Capacitor config — points the native shell at the Lovable
 * sandbox so changes hot-reload on device. DO NOT ship this to production.
 *
 * Usage:
 *   npm run cap:sync:dev   # copies this over capacitor.config.ts then syncs
 */
const config: CapacitorConfig = {
  appId: 'app.lovable.0eeac6953ca245ba87e8f046d5957181',
  appName: 'HealthOS 24',
  webDir: 'dist',
  server: {
    url: 'https://0eeac695-3ca2-45ba-87e8-f046d5957181.lovableproject.com?forceHideBadge=true',
    cleartext: true,
    // Branded offline fallback (bundled in dist/) so the native WebView never
    // shows the OEM "Webpage not available" screen when the sandbox is unreachable.
    errorPath: '/offline.html',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: false,
      backgroundColor: '#0891b2',
      showSpinner: true,
      spinnerColor: '#ffffff',
      androidScaleType: 'CENTER_INSIDE',
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#0891b2',
    },
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0891b2',
    webContentsDebuggingEnabled: true,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0891b2',
  },
};

export default config;

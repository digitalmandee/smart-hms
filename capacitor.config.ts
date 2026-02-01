import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0eeac6953ca245ba87e8f046d5957181',
  appName: 'smart-hms',
  webDir: 'dist',
  server: {
    url: 'https://0eeac695-3ca2-45ba-87e8-f046d5957181.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0891b2',
      showSpinner: true,
      spinnerColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0891b2'
    }
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0891b2'
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0891b2'
  }
};

export default config;

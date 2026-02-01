import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { useEffect, useState } from 'react';

export interface CapacitorState {
  isNative: boolean;
  platform: 'ios' | 'android' | 'web';
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
  isReady: boolean;
}

export function useCapacitor(): CapacitorState {
  const [isReady, setIsReady] = useState(false);
  
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';

  useEffect(() => {
    const initializeNative = async () => {
      if (!isNative) {
        setIsReady(true);
        return;
      }

      try {
        // Configure status bar
        if (platform === 'ios' || platform === 'android') {
          await StatusBar.setStyle({ style: Style.Light });
          if (platform === 'android') {
            await StatusBar.setBackgroundColor({ color: '#0891b2' });
          }
        }

        // Setup keyboard listeners
        Keyboard.addListener('keyboardWillShow', () => {
          document.body.classList.add('keyboard-open');
        });
        
        Keyboard.addListener('keyboardWillHide', () => {
          document.body.classList.remove('keyboard-open');
        });

        // Handle app state changes
        App.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            document.body.classList.remove('app-paused');
          } else {
            document.body.classList.add('app-paused');
          }
        });

        // Handle back button on Android
        App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            App.exitApp();
          } else {
            window.history.back();
          }
        });

        // Hide splash screen after initialization
        await SplashScreen.hide();
        
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize native features:', error);
        setIsReady(true);
      }
    };

    initializeNative();

    return () => {
      if (isNative) {
        Keyboard.removeAllListeners();
        App.removeAllListeners();
      }
    };
  }, [isNative, platform]);

  return {
    isNative,
    platform,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
    isReady
  };
}

// Utility function for checking platform without hook
export function getPlatformInfo() {
  const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
  return {
    isNative: Capacitor.isNativePlatform(),
    platform,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web'
  };
}

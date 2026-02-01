import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { useCallback } from 'react';

export function useHaptics() {
  const isNative = Capacitor.isNativePlatform();

  const impact = useCallback(async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!isNative) return;
    
    try {
      const impactStyle = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy
      }[style];
      
      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  }, [isNative]);

  const notification = useCallback(async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (!isNative) return;
    
    try {
      const notificationType = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error
      }[type];
      
      await Haptics.notification({ type: notificationType });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  }, [isNative]);

  const vibrate = useCallback(async (duration: number = 300) => {
    if (!isNative) return;
    
    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  }, [isNative]);

  const selectionStart = useCallback(async () => {
    if (!isNative) return;
    
    try {
      await Haptics.selectionStart();
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  }, [isNative]);

  const selectionChanged = useCallback(async () => {
    if (!isNative) return;
    
    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  }, [isNative]);

  const selectionEnd = useCallback(async () => {
    if (!isNative) return;
    
    try {
      await Haptics.selectionEnd();
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  }, [isNative]);

  return {
    isAvailable: isNative,
    impact,
    notification,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd,
    // Convenience methods
    light: () => impact('light'),
    medium: () => impact('medium'),
    heavy: () => impact('heavy'),
    success: () => notification('success'),
    warning: () => notification('warning'),
    error: () => notification('error')
  };
}

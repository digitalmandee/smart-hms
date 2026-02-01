import { toast } from 'sonner';
import { useHaptics } from './useHaptics';
import { useNativeSounds } from './useNativeSounds';
import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  description?: string;
}

export function useMobileToast() {
  const haptics = useHaptics();
  const sounds = useNativeSounds();
  const isNative = Capacitor.isNativePlatform();

  const showSuccess = useCallback((message: string, options?: ToastOptions) => {
    if (isNative) {
      haptics.success();
      sounds.playSuccessSound();
    }
    
    toast.success(message, {
      duration: options?.duration ?? 3000,
      description: options?.description,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    });
  }, [isNative, haptics, sounds]);

  const showError = useCallback((message: string, options?: ToastOptions) => {
    if (isNative) {
      haptics.error();
      sounds.playErrorSound();
    }
    
    toast.error(message, {
      duration: options?.duration ?? 5000,
      description: options?.description,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    });
  }, [isNative, haptics, sounds]);

  const showWarning = useCallback((message: string, options?: ToastOptions) => {
    if (isNative) {
      haptics.warning();
      sounds.playNotificationSound();
    }
    
    toast.warning(message, {
      duration: options?.duration ?? 4000,
      description: options?.description,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    });
  }, [isNative, haptics, sounds]);

  const showInfo = useCallback((message: string, options?: ToastOptions) => {
    if (isNative) {
      haptics.light();
      sounds.playNotificationSound();
    }
    
    toast.info(message, {
      duration: options?.duration ?? 3000,
      description: options?.description,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    });
  }, [isNative, haptics, sounds]);

  const showLoading = useCallback((message: string) => {
    return toast.loading(message);
  }, []);

  const dismiss = useCallback((toastId?: string | number) => {
    toast.dismiss(toastId);
  }, []);

  return {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    loading: showLoading,
    dismiss,
    // Native status
    isNative
  };
}

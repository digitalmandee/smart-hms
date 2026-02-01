import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCapacitor, CapacitorState } from '@/hooks/useCapacitor';
import { useHaptics } from '@/hooks/useHaptics';
import { useNativeSounds } from '@/hooks/useNativeSounds';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useMobileToast } from '@/hooks/useMobileToast';

interface MobileContextType {
  // Platform info
  capacitor: CapacitorState;
  // Haptic feedback
  haptics: ReturnType<typeof useHaptics>;
  // Sound effects
  sounds: ReturnType<typeof useNativeSounds>;
  // Push notifications
  pushNotifications: ReturnType<typeof usePushNotifications>;
  // Mobile toast
  toast: ReturnType<typeof useMobileToast>;
  // UI state
  isBottomSheetOpen: boolean;
  setBottomSheetOpen: (open: boolean) => void;
  isRefreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
}

const MobileContext = createContext<MobileContextType | undefined>(undefined);

interface MobileProviderProps {
  children: ReactNode;
}

export function MobileProvider({ children }: MobileProviderProps) {
  const capacitor = useCapacitor();
  const haptics = useHaptics();
  const sounds = useNativeSounds();
  const pushNotifications = usePushNotifications();
  const toast = useMobileToast();
  
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);

  // Apply mobile-specific body classes
  useEffect(() => {
    if (capacitor.isNative) {
      document.body.classList.add('capacitor-native');
      document.body.classList.add(`platform-${capacitor.platform}`);
    }
    
    return () => {
      document.body.classList.remove('capacitor-native');
      document.body.classList.remove(`platform-${capacitor.platform}`);
    };
  }, [capacitor.isNative, capacitor.platform]);

  const value: MobileContextType = {
    capacitor,
    haptics,
    sounds,
    pushNotifications,
    toast,
    isBottomSheetOpen,
    setBottomSheetOpen,
    isRefreshing,
    setRefreshing
  };

  return (
    <MobileContext.Provider value={value}>
      {children}
    </MobileContext.Provider>
  );
}

export function useMobile() {
  const context = useContext(MobileContext);
  if (context === undefined) {
    throw new Error('useMobile must be used within a MobileProvider');
  }
  return context;
}

// Convenience hook for checking if we're on mobile native
export function useIsMobileNative() {
  const context = useContext(MobileContext);
  return context?.capacitor.isNative ?? false;
}

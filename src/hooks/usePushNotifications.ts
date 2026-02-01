import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PushNotificationState {
  isRegistered: boolean;
  token: string | null;
  error: string | null;
  hasPermission: boolean;
}

export function usePushNotifications() {
  const { user, profile } = useAuth();
  const isNative = Capacitor.isNativePlatform();
  const [state, setState] = useState<PushNotificationState>({
    isRegistered: false,
    token: null,
    error: null,
    hasPermission: false
  });

  const registerToken = useCallback(async (token: string) => {
    if (!user || !profile?.organization_id) return;

    try {
      const platform = Capacitor.getPlatform();
      
      // Use raw query approach since types may not be updated yet
      const { error } = await (supabase as any)
        .from('push_device_tokens')
        .upsert({
          user_id: user.id,
          organization_id: profile.organization_id,
          token,
          platform,
          device_name: navigator.userAgent.substring(0, 100),
          is_active: true,
          last_used_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,token'
        });

      if (error) {
        console.warn('Token registration warning:', error);
      }
      
      setState(prev => ({ ...prev, token, isRegistered: true }));
    } catch (error) {
      console.error('Failed to register push token:', error);
      setState(prev => ({ ...prev, error: 'Failed to register device' }));
    }
  }, [user, profile?.organization_id]);

  const requestPermissions = useCallback(async () => {
    if (!isNative) {
      // Web push notifications - check if supported
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setState(prev => ({ ...prev, hasPermission: permission === 'granted' }));
        return permission === 'granted';
      }
      return false;
    }

    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      const hasPermission = permStatus.receive === 'granted';
      setState(prev => ({ ...prev, hasPermission }));

      if (hasPermission) {
        await PushNotifications.register();
      }

      return hasPermission;
    } catch (error) {
      console.error('Push permission error:', error);
      setState(prev => ({ ...prev, error: 'Permission request failed' }));
      return false;
    }
  }, [isNative]);

  const showLocalNotification = useCallback(async (title: string, body: string, data?: Record<string, any>) => {
    if (!isNative) {
      // Web notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, data });
      }
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            extra: data,
            smallIcon: 'ic_notification',
            iconColor: '#0891b2'
          }
        ]
      });
    } catch (error) {
      console.error('Failed to show local notification:', error);
    }
  }, [isNative]);

  useEffect(() => {
    if (!isNative) return;

    // Set up push notification listeners
    const registrationListener = PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success:', token.value);
      registerToken(token.value);
    });

    const registrationErrorListener = PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
      setState(prev => ({ ...prev, error: error.error }));
    });

    const pushReceivedListener = PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push received:', notification);
      // Show local notification when app is in foreground
      showLocalNotification(notification.title || 'Notification', notification.body || '', notification.data);
    });

    const pushActionListener = PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Push action performed:', action);
      // Handle notification tap - navigate to relevant screen
      const data = action.notification.data;
      if (data?.route) {
        window.location.href = data.route;
      }
    });

    // Request permissions on mount if user is logged in
    if (user) {
      requestPermissions();
    }

    return () => {
      registrationListener.then(l => l.remove());
      registrationErrorListener.then(l => l.remove());
      pushReceivedListener.then(l => l.remove());
      pushActionListener.then(l => l.remove());
    };
  }, [isNative, user, registerToken, requestPermissions, showLocalNotification]);

  const unregisterDevice = useCallback(async () => {
    if (!user || !state.token) return;

    try {
      // Update using type assertion since types may not be synced
      await (supabase as any)
        .from('push_device_tokens')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('token', state.token);

      if (isNative) {
        await PushNotifications.unregister();
      }

      setState(prev => ({ ...prev, isRegistered: false, token: null }));
    } catch (error) {
      console.error('Failed to unregister device:', error);
    }
  }, [user, state.token, isNative]);

  return {
    ...state,
    isNative,
    requestPermissions,
    showLocalNotification,
    unregisterDevice
  };
}

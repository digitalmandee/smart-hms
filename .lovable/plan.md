

# HealthOS 24 Native Mobile App with Capacitor

## Overview

This plan implements a complete native mobile app for HealthOS 24 using Capacitor, providing dedicated experiences for **Doctors**, **Nurses**, **Patients**, and all staff roles. The app will feature push notifications, native sounds, haptic feedback, splash screens, and a login-first experience on mobile devices.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                    HealthOS 24 Mobile App                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   iOS App   │  │ Android App │  │   Web App   │             │
│  │  (Xcode)    │  │  (Android   │  │  (Browser)  │             │
│  │             │  │   Studio)   │  │             │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         └────────────────┴────────────────┘                     │
│                          │                                      │
│              ┌───────────┴───────────┐                          │
│              │    Capacitor Bridge    │                          │
│              └───────────┬───────────┘                          │
│                          │                                      │
│  ┌───────────────────────┴───────────────────────┐              │
│  │              React Application                 │              │
│  │  ┌─────────────────────────────────────────┐  │              │
│  │  │  Mobile-Specific Components & Layouts   │  │              │
│  │  │  - MobileLayout (bottom navigation)     │  │              │
│  │  │  - MobileSplashScreen                   │  │              │
│  │  │  - MobileLoginPage                      │  │              │
│  │  │  - Role-based Mobile Dashboards         │  │              │
│  │  └─────────────────────────────────────────┘  │              │
│  │                                               │              │
│  │  ┌─────────────────────────────────────────┐  │              │
│  │  │       Capacitor Plugins/Hooks           │  │              │
│  │  │  - usePushNotifications                 │  │              │
│  │  │  - useHaptics                           │  │              │
│  │  │  - useNativeSounds                      │  │              │
│  │  │  - useDevice                            │  │              │
│  │  │  - useBiometric                         │  │              │
│  │  └─────────────────────────────────────────┘  │              │
│  └───────────────────────────────────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Role-Based Mobile Experiences

### Doctor Mobile App
- **Dashboard**: Today's appointments, pending surgeries, earnings
- **Quick Actions**: Start consultation, view patient, confirm surgery
- **Notifications**: New appointments, surgery confirmations, lab results
- **Calendar**: Personal schedule with surgery slots

### Nurse Mobile App
- **Dashboard**: Ward overview, pending tasks, vitals to record
- **Quick Actions**: Record vitals, medication administration, nursing notes
- **Notifications**: New admissions, doctor orders, critical alerts
- **Tasks**: Checklist of pending nursing care items

### Patient Mobile App
- **Dashboard**: Upcoming appointments, prescriptions, bills
- **Quick Actions**: Book appointment, view reports, pay bills
- **Notifications**: Appointment reminders, lab results ready, bill due
- **Records**: Medical history, prescriptions, lab reports

### Staff Mobile App (Receptionist, Pharmacist, Lab Tech, etc.)
- Role-specific dashboards matching desktop functionality
- Optimized for mobile workflows
- Quick action buttons for common tasks

---

## Implementation Phases

### Phase 1: Capacitor Setup & Configuration

**New Files:**
- `capacitor.config.ts` - Main Capacitor configuration
- `android/` - Android native project (auto-generated)
- `ios/` - iOS native project (auto-generated)

**Package.json Updates:**
```json
{
  "dependencies": {
    "@capacitor/core": "^6.0.0",
    "@capacitor/android": "^6.0.0",
    "@capacitor/ios": "^6.0.0",
    "@capacitor/app": "^6.0.0",
    "@capacitor/haptics": "^6.0.0",
    "@capacitor/push-notifications": "^6.0.0",
    "@capacitor/splash-screen": "^6.0.0",
    "@capacitor/status-bar": "^6.0.0",
    "@capacitor/keyboard": "^6.0.0",
    "@capacitor/local-notifications": "^6.0.0",
    "@capacitor/preferences": "^6.0.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^6.0.0"
  }
}
```

**Capacitor Config:**
```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.healthos24.app',
  appName: 'HealthOS 24',
  webDir: 'dist',
  server: {
    // For development - hot reload from sandbox
    url: 'https://0eeac695-3ca2-45ba-87e8-f046d5957181.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0891b2', // Primary color
      showSpinner: true,
      spinnerColor: '#ffffff'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    }
  },
  android: {
    allowMixedContent: true
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
```

---

### Phase 2: Platform Detection & Routing

**New Files:**
- `src/hooks/useCapacitor.ts` - Detect native platform
- `src/hooks/usePushNotifications.ts` - Push notification handling
- `src/hooks/useHaptics.ts` - Haptic feedback
- `src/hooks/useNativeSounds.ts` - Native sound effects
- `src/contexts/MobileContext.tsx` - Mobile state management

**useCapacitor Hook:**
```typescript
// Detects if running in Capacitor native shell
import { Capacitor } from '@capacitor/core';

export function useCapacitor() {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform(); // 'ios', 'android', 'web'
  
  return {
    isNative,
    platform,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web'
  };
}
```

---

### Phase 3: Mobile-Specific Layouts

**New Files:**
- `src/layouts/MobileLayout.tsx` - Bottom navigation layout
- `src/layouts/MobileSplashLayout.tsx` - Splash screen wrapper
- `src/components/mobile/BottomNavigation.tsx` - Native-style bottom nav
- `src/components/mobile/MobileHeader.tsx` - Compact mobile header
- `src/components/mobile/PullToRefresh.tsx` - Native pull-to-refresh

**Mobile Layout Structure:**
```text
┌──────────────────────────────┐
│  MobileHeader               │ ← Minimal, shows logo + profile
├──────────────────────────────┤
│                              │
│                              │
│       Main Content           │ ← Scrollable, full height
│     (with pull-to-refresh)   │
│                              │
│                              │
├──────────────────────────────┤
│  ● Home │ ● Tasks │ ● More  │ ← Bottom Navigation (role-based)
└──────────────────────────────┘
```

---

### Phase 4: Mobile Login Experience

**New/Modified Files:**
- `src/pages/mobile/MobileLoginPage.tsx` - Full-screen mobile login
- `src/pages/mobile/MobileSplashScreen.tsx` - Animated splash

**Mobile Login Flow:**
```text
1. App Launch
   ↓
2. Splash Screen (2 seconds)
   - HealthOS 24 logo animation
   - Loading spinner
   ↓
3. Check Auth State
   ↓
   ├── Not Logged In → Mobile Login Page
   │   - Full-screen login form
   │   - Biometric option (Face ID / Fingerprint)
   │   - "Remember Me" toggle
   │   ↓
   │   Login Success
   │   ↓
   └── Logged In → Role-Based Dashboard
       - Doctor → Doctor Mobile Dashboard
       - Nurse → Nurse Mobile Dashboard
       - Patient → Patient Mobile Dashboard
       - Other → Staff Mobile Dashboard
```

---

### Phase 5: Push Notifications System

**New Files:**
- `src/hooks/usePushNotifications.ts` - Push notification registration & handling
- `src/services/pushNotificationService.ts` - FCM/APNs integration
- `supabase/functions/send-push-notification/index.ts` - Edge function for sending pushes

**Database Migration - Device Tokens:**
```sql
CREATE TABLE push_device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_name TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, token)
);

CREATE INDEX idx_push_tokens_user ON push_device_tokens(user_id);
CREATE INDEX idx_push_tokens_org ON push_device_tokens(organization_id);
```

**Push Notification Categories:**
| Category | Roles | Sound | Priority |
|----------|-------|-------|----------|
| New Appointment | Doctor | chime | Normal |
| Patient Check-in | Doctor | alert | High |
| Surgery Confirmation | Surgeon | urgent | Critical |
| Lab Results Ready | Doctor, Patient | success | Normal |
| Medication Due | Nurse | reminder | High |
| Critical Vitals | Nurse, Doctor | alarm | Critical |
| Bill Payment | Patient | notification | Low |
| Appointment Reminder | Patient | gentle | Normal |

---

### Phase 6: Native Sound & Haptics

**New Files:**
- `src/hooks/useHaptics.ts` - Haptic feedback patterns
- `src/hooks/useNativeSounds.ts` - Sound effect player
- `public/sounds/` - Sound assets (notification.mp3, success.mp3, error.mp3, etc.)

**Haptic Patterns:**
```typescript
// Different feedback for different actions
const haptics = {
  light: () => Haptics.impact({ style: ImpactStyle.Light }),
  medium: () => Haptics.impact({ style: ImpactStyle.Medium }),
  heavy: () => Haptics.impact({ style: ImpactStyle.Heavy }),
  success: () => Haptics.notification({ type: NotificationType.Success }),
  warning: () => Haptics.notification({ type: NotificationType.Warning }),
  error: () => Haptics.notification({ type: NotificationType.Error }),
};
```

**Usage in Toasts:**
```typescript
// Enhanced toast with sound + haptics
export function showMobileToast(type: 'success' | 'error' | 'info', message: string) {
  if (isNative) {
    haptics[type]();
    playSound(type);
  }
  toast[type](message);
}
```

---

### Phase 7: Role-Based Mobile Dashboards

**New Files:**
- `src/pages/mobile/DoctorMobileDashboard.tsx`
- `src/pages/mobile/NurseMobileDashboard.tsx`
- `src/pages/mobile/PatientMobileDashboard.tsx`
- `src/pages/mobile/StaffMobileDashboard.tsx`
- `src/components/mobile/QuickActionCard.tsx`
- `src/components/mobile/MobileStatsCard.tsx`
- `src/components/mobile/AppointmentCard.tsx`
- `src/components/mobile/TaskCard.tsx`

**Doctor Mobile Dashboard:**
```text
┌────────────────────────────────────┐
│  Good Morning, Dr. Ahmed           │
│  Today: Feb 1, 2026                │
├────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐         │
│ │    12    │ │     3    │         │
│ │ Patients │ │Surgeries │         │
│ │  Today   │ │ Pending  │         │
│ └──────────┘ └──────────┘         │
├────────────────────────────────────┤
│ Quick Actions                      │
│ ┌────────┐ ┌────────┐ ┌────────┐  │
│ │  👁️    │ │  📋    │ │  ✅    │  │
│ │ Start  │ │Patient │ │Confirm │  │
│ │Consult │ │ Search │ │Surgery │  │
│ └────────┘ └────────┘ └────────┘  │
├────────────────────────────────────┤
│ Next Up                            │
│ ┌────────────────────────────────┐ │
│ │ 🟢 Token #15 - Ahmed Khan      │ │
│ │    10:30 AM - Follow-up        │ │
│ │    [Start Consultation]        │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ 🟡 Token #16 - Sara Ali        │ │
│ │    10:45 AM - New Patient      │ │
│ └────────────────────────────────┘ │
├────────────────────────────────────┤
│  🏠 Home    📋 Queue    ⚙️ More    │
└────────────────────────────────────┘
```

---

### Phase 8: Enhanced Mobile Toast System

**Modified Files:**
- `src/components/ui/sonner.tsx` - Add mobile-specific configuration
- `src/hooks/useMobileToast.ts` - Mobile-enhanced toast hook

**Mobile Toast Features:**
- Haptic feedback on toast appearance
- Sound effects based on toast type
- Swipe to dismiss
- Action buttons with haptics
- Badge count updates on iOS

---

### Phase 9: App Updates & Hot Reload

**Files:**
- `src/hooks/useAppUpdates.ts` - Check for app updates
- `src/components/mobile/UpdatePrompt.tsx` - Update available UI

**Update Flow:**
- Check version on app focus
- Show non-intrusive banner for optional updates
- Force update modal for critical updates

---

## File Structure Summary

```text
project/
├── capacitor.config.ts                    # NEW - Capacitor config
├── package.json                           # MODIFIED - Add Capacitor deps
├── index.html                             # MODIFIED - Add mobile meta tags
├── public/
│   ├── sounds/                            # NEW - Sound assets
│   │   ├── notification.mp3
│   │   ├── success.mp3
│   │   ├── error.mp3
│   │   └── alert.mp3
│   └── splash/                            # NEW - Splash screen assets
│       ├── splash.png
│       └── icon.png
├── src/
│   ├── contexts/
│   │   └── MobileContext.tsx              # NEW - Mobile state
│   ├── hooks/
│   │   ├── useCapacitor.ts               # NEW - Platform detection
│   │   ├── usePushNotifications.ts       # NEW - Push handling
│   │   ├── useHaptics.ts                 # NEW - Haptic feedback
│   │   ├── useNativeSounds.ts            # NEW - Sound effects
│   │   ├── useMobileToast.ts             # NEW - Enhanced toasts
│   │   └── useBiometricAuth.ts           # NEW - Face ID/Fingerprint
│   ├── layouts/
│   │   ├── MobileLayout.tsx              # NEW - Bottom nav layout
│   │   └── MobileSplashLayout.tsx        # NEW - Splash wrapper
│   ├── pages/
│   │   └── mobile/
│   │       ├── MobileLoginPage.tsx       # NEW - Mobile login
│   │       ├── MobileSplashScreen.tsx    # NEW - Splash screen
│   │       ├── DoctorMobileDashboard.tsx # NEW - Doctor home
│   │       ├── NurseMobileDashboard.tsx  # NEW - Nurse home
│   │       ├── PatientMobileDashboard.tsx# NEW - Patient home
│   │       └── StaffMobileDashboard.tsx  # NEW - Generic staff
│   ├── components/
│   │   └── mobile/
│   │       ├── BottomNavigation.tsx      # NEW - Tab bar
│   │       ├── MobileHeader.tsx          # NEW - Compact header
│   │       ├── PullToRefresh.tsx         # NEW - Pull gesture
│   │       ├── QuickActionCard.tsx       # NEW - Action buttons
│   │       ├── MobileStatsCard.tsx       # NEW - Stat display
│   │       ├── AppointmentCard.tsx       # NEW - Appointment item
│   │       ├── TaskCard.tsx              # NEW - Task item
│   │       └── UpdatePrompt.tsx          # NEW - Update banner
│   └── services/
│       └── pushNotificationService.ts    # NEW - Push service
└── supabase/
    └── functions/
        └── send-push-notification/       # NEW - Push sender
            └── index.ts
```

---

## Database Changes

### New Table: push_device_tokens
Stores FCM/APNs tokens for each user's devices.

### New Table: notification_preferences
Stores user preferences for notification categories.

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  vibration_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category)
);
```

---

## Mobile-Specific index.html Updates

```html
<!-- Mobile-specific meta tags -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="HealthOS 24" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="theme-color" content="#0891b2" />

<!-- Disable text selection on mobile -->
<style>
  .mobile-no-select {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
</style>
```

---

## Implementation Order

| Phase | Components | Dependencies |
|-------|------------|--------------|
| 1 | Capacitor setup, config | None |
| 2 | Platform detection hooks | Phase 1 |
| 3 | Mobile layouts | Phase 2 |
| 4 | Mobile login/splash | Phase 3 |
| 5 | Push notifications | Phase 4, Supabase |
| 6 | Sounds & haptics | Phase 2 |
| 7 | Role dashboards | Phase 3, 4 |
| 8 | Enhanced toasts | Phase 5, 6 |
| 9 | App updates | Phase 1 |

---

## Post-Implementation Steps

After code implementation, you will need to:

1. **Export to GitHub** - Transfer project to your own repository
2. **Local Setup**:
   ```bash
   git clone <your-repo>
   cd <project>
   npm install
   npx cap add ios
   npx cap add android
   npm run build
   npx cap sync
   ```
3. **iOS Development** (Mac required):
   - Open in Xcode: `npx cap open ios`
   - Configure signing & capabilities
   - Add Push Notifications capability
   - Configure APNs certificates
4. **Android Development**:
   - Open in Android Studio: `npx cap open android`
   - Configure Firebase Cloud Messaging
   - Add google-services.json
5. **Store Deployment**:
   - Apple App Store: Create provisioning profiles, build archive
   - Google Play Store: Generate signed APK/AAB

---

## Summary

| Feature | Implementation |
|---------|----------------|
| Native Apps | Capacitor 6 for iOS & Android |
| Push Notifications | FCM (Android) + APNs (iOS) |
| Haptic Feedback | @capacitor/haptics |
| Native Sounds | Audio files + Web Audio API |
| Splash Screen | @capacitor/splash-screen |
| Biometric Auth | @capacitor/face-id (future) |
| Mobile Layouts | Bottom navigation, compact headers |
| Role Dashboards | Doctor, Nurse, Patient, Staff |
| Login First | Mobile-specific auth flow |

This creates a truly native mobile experience for HealthOS 24 that rivals dedicated native apps while sharing the codebase with the web application.


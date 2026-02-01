
# Fix Mobile Auto-Redirect for All Routes

## Problem Identified

The mobile redirect hook (`useMobileRedirect`) is only being called in `DashboardPage.tsx`, but you're accessing `/app/opd` which uses `DoctorDashboard` directly - it never goes through DashboardPage and never triggers the mobile redirect.

**Current Flow:**
```
User on mobile visits /app/opd
    ↓
DashboardLayout.tsx (no mobile check!)
    ↓
DoctorDashboard.tsx (desktop layout shown)
```

**Expected Flow:**
```
User on mobile visits /app/opd
    ↓
DashboardLayout.tsx → useMobileRedirect() → detects mobile
    ↓
Redirect to /mobile/dashboard
    ↓
MobileLayout with native bottom navigation
```

---

## Solution

Add the `useMobileRedirect` hook to `DashboardLayout.tsx` so that **every** `/app/*` route automatically redirects mobile users to the mobile experience.

---

## Files to Modify

### 1. `src/layouts/DashboardLayout.tsx`

**Changes:**
- Import and call `useMobileRedirect()` hook at the top of the component
- Show a loading state while the redirect check is in progress
- This ensures ALL routes under `/app/*` trigger the mobile detection

```typescript
// Add import
import { useMobileRedirect } from "@/hooks/useMobileRedirect";

export const DashboardLayout = () => {
  const { checked } = useMobileRedirect();  // ADD THIS
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Show loading while checking redirect
  if (!checked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    // ... existing desktop layout
  );
};
```

### 2. `src/pages/app/DashboardPage.tsx`

**Changes:**
- Remove the duplicate mobile redirect logic from this file since it will now be handled at the layout level

---

## Why This Works

| Route | Before | After |
|-------|--------|-------|
| `/app/dashboard` | Redirects (via DashboardPage) | Redirects (via DashboardLayout) |
| `/app/opd` | **NO redirect** (shows desktop) | Redirects (via DashboardLayout) |
| `/app/pharmacy` | **NO redirect** (shows desktop) | Redirects (via DashboardLayout) |
| `/app/lab` | **NO redirect** (shows desktop) | Redirects (via DashboardLayout) |
| All `/app/*` routes | Some redirect, most don't | **All redirect on mobile** |

---

## Technical Details

The `useMobileRedirect` hook:
1. Checks if user is on a Capacitor native platform
2. Checks if screen width is less than 768px
3. Maps current route to its mobile equivalent (e.g., `/app/opd` → `/mobile/dashboard`)
4. Performs the redirect with `navigate(mobileRoute, { replace: true })`

By placing this in `DashboardLayout`, which wraps ALL `/app/*` routes, every authenticated desktop route will trigger the mobile check before rendering.

---

## Summary

| Change | Impact |
|--------|--------|
| Add `useMobileRedirect` to DashboardLayout | All /app/* routes check for mobile |
| Add loading state during check | Prevents flash of desktop UI |
| Remove duplicate from DashboardPage | Cleaner code, single source of truth |

This single change fixes the issue - mobile users will now automatically see the native mobile experience regardless of which `/app/*` route they try to access.

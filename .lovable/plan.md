
# Side Menu + Smooth Page Transitions Plan

## Issues Identified

### Issue 1: Profile and More Pages Have Duplicate Content
- **Profile page** (lines 141-162) has menu items: Edit Profile, Notifications, Privacy & Security, Help & Support
- **More page** (lines 167-191) has similar sections: Account (Settings, Notifications, Privacy), Support (Help, Terms, About)
- Both pages essentially duplicate "Account" and "Support" menu items
- User wants: **Profile** = personal info only, **More** = slide-out side menu

### Issue 2: No Slide-Out Side Menu
- Currently, the hamburger menu (Menu icon) in `MobileHeader.tsx` (line 37-40) navigates to `/app/more` page
- User expects: Hamburger should open a **slide-out side menu** (Sheet component) instead of navigating to a page
- The Sheet component already exists (`src/components/ui/sheet.tsx`) with left/right slide animations

### Issue 3: Glitchy Page Transitions
- Current animation in `index.css` (lines 556-570) is `slideInFromRight` - basic fade + slight slide
- This creates a "glitch" feeling because it's not a full iOS/Android-style transition
- Need smoother, more native-like page transitions or a loading splash between screens

---

## Implementation Plan

### Phase 1: Create Mobile Side Menu Component

**New File: `src/components/mobile/MobileSideMenu.tsx`**

Create a slide-out side menu using the Sheet component:

```typescript
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { 
  Settings, Bell, Shield, HelpCircle, FileText, Info, 
  Calendar, Stethoscope, ClipboardList, Pill, TestTube, Wallet,
  LogOut, Moon, X
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { useHaptics } from "@/hooks/useHaptics";

interface MobileSideMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSideMenu({ open, onOpenChange }: MobileSideMenuProps) {
  // Profile header with avatar
  // Quick Actions grid
  // Account menu (Settings, Notifications, Privacy)
  // Support menu (Help, Terms, About)
  // Dark Mode toggle
  // Sign Out button
  // App version
}
```

Features:
- Opens from left side (matching iOS/Android pattern)
- Contains user profile summary at top
- Quick action shortcuts
- All settings/menu items currently in More page
- Dark mode toggle
- Sign out button
- Closes when user taps a menu item or overlay

### Phase 2: Update MobileHeader to Use Sheet

**File: `src/components/mobile/MobileHeader.tsx`**

Change hamburger button to open side menu sheet instead of navigating:

```typescript
// Add state and import Sheet
const [sideMenuOpen, setSideMenuOpen] = useState(false);

// Change menu button onClick
<Button onClick={() => setSideMenuOpen(true)}>
  <Menu />
</Button>

// Add Sheet component
<MobileSideMenu open={sideMenuOpen} onOpenChange={setSideMenuOpen} />
```

### Phase 3: Simplify Profile Page (Mobile View)

**File: `src/pages/app/ProfilePage.tsx`**

Remove duplicate menu items, keep only personal profile content:

Current mobile view has:
- Avatar, name, email, role badge (KEEP)
- Dark Mode toggle (KEEP - personal preference)
- Push Notifications toggle (KEEP - personal preference)
- Edit Profile, Notifications, Privacy, Help menu items (REMOVE - these move to side menu)
- Sign Out button (REMOVE - moves to side menu)

New mobile profile page content:
- Profile header (avatar, name, email, role)
- Personal settings toggles (Dark Mode, Push Notifications)
- Edit Profile button (single action)
- Version info

### Phase 4: Remove or Simplify More Page

**File: `src/pages/app/MorePage.tsx`**

Since the side menu now handles all the "More" functionality:
- Mobile view: Redirect to dashboard or show minimal content
- Or: Remove from bottom navigation entirely, replace with another useful tab

**File: `src/components/mobile/BottomNavigation.tsx`**

Option A: Remove "More" tab, keep only 4-5 tabs
Option B: Replace "More" with another useful action (e.g., "Wallet", "Settings direct link")

Recommended: Remove "More" from bottom nav since hamburger menu now handles it

### Phase 5: Improve Page Transitions

**File: `src/index.css`**

Enhance the mobile page transitions for smoother experience:

```css
/* Improved iOS-style page transition */
.mobile-page-content {
  animation: pageSlideIn 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes pageSlideIn {
  from {
    opacity: 0;
    transform: translateX(30%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Alternative: Fade transition for less motion */
@media (prefers-reduced-motion: reduce) {
  .mobile-page-content {
    animation: pageFadeIn 0.2s ease-out;
  }
}

@keyframes pageFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Phase 6: Add Page Loading State (Optional Enhancement)

**New File: `src/components/mobile/PageTransition.tsx`**

For longer loading operations, show a brief loading state:

```typescript
export function PageTransition({ children, isLoading }: { children: React.ReactNode; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {children}
    </div>
  );
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/mobile/MobileSideMenu.tsx` | **NEW** - Slide-out side menu component |
| `src/components/mobile/MobileHeader.tsx` | Add Sheet state, open side menu on hamburger click |
| `src/pages/app/ProfilePage.tsx` | Simplify mobile view - remove duplicate menu items |
| `src/components/mobile/BottomNavigation.tsx` | Remove "More" tab from navigation |
| `src/index.css` | Improve page transition animation |

---

## Visual Layout After Changes

**Header:**
```
[☰] [🔍]     [LOGO]     [🔔] [👤]
```
- ☰ opens slide-out side menu
- 👤 goes to simplified Profile page

**Side Menu (slides from left):**
```
┌─────────────────────────────┐
│ [X]                         │
│                             │
│ ┌─────┐                     │
│ │ 👤  │ Dr. Ahmed Khan      │
│ └─────┘ Doctor              │
│                             │
│ ─────────────────────────── │
│ Quick Actions               │
│ [📅] [🩺] [💊] [🔬] [💰]   │
│                             │
│ ─────────────────────────── │
│ Account                     │
│ ⚙️ Settings            >    │
│ 🔔 Notifications       >    │
│ 🛡️ Privacy & Security  >    │
│                             │
│ ─────────────────────────── │
│ Support                     │
│ ❓ Help & FAQ          >    │
│ 📄 Terms of Service    >    │
│ ℹ️ About               >    │
│                             │
│ ─────────────────────────── │
│ 🌙 Dark Mode      [toggle]  │
│                             │
│ [🚪 Sign Out]               │
│                             │
│ v2.0.0                      │
└─────────────────────────────┘
```

**Profile Page (simplified):**
```
      ┌─────┐
      │ 👤  │
      └─────┘
   Dr. Ahmed Khan
   ahmed@hospital.com
      [Doctor]

   ─────────────────
   
   🌙 Dark Mode     [toggle]
   📱 Push Notif.   [toggle]
   
   [Edit Profile]
   
   v2.0.0
```

**Bottom Navigation (updated):**
```
[🏠]  [📅]  [📋]  [👤]
Home  Schedule Tasks Profile
```
(Removed "More" - now accessed via hamburger)

---

## Expected Results

1. **Hamburger menu opens slide-out side menu** instead of navigating to a page
2. **No duplicate content** between Profile and More
3. **Profile page focuses on personal info** (avatar, preferences, edit)
4. **Side menu has all app navigation** (quick actions, settings, support)
5. **Smoother page transitions** with improved cubic-bezier animation
6. **Cleaner bottom navigation** with 4 focused tabs


# Mobile Side Menu Feature Parity Plan

## Problem Summary

The mobile side menu is **completely different** from the desktop sidebar:
- **Desktop Sidebar**: Uses `ROLE_SIDEBAR_CONFIG` to dynamically render all menu items based on user role (Doctor gets 6 main sections, Nurse gets different sections, etc.)
- **Mobile Side Menu**: Has hardcoded "Quick Actions" grid with only 4-5 basic shortcuts (Schedule, Consult, Tasks, etc.)

This means doctors, nurses, pharmacists, and other staff are **missing most of their navigation options** on mobile.

---

## Solution Overview

Rebuild the mobile side menu to render the **same menu items** from `ROLE_SIDEBAR_CONFIG` that the desktop sidebar uses, with proper mobile-friendly touch interactions.

---

## Technical Implementation

### File: `src/components/mobile/MobileSideMenu.tsx`

**Current Structure (Hardcoded):**
```
Profile Header
Quick Actions Grid (4-5 icons) ← Only shows a few hardcoded shortcuts
Account Section (Settings, Notifications, Privacy)
Support Section (Help, Terms, About)
Dark Mode Toggle
Sign Out
```

**New Structure (Dynamic, Feature Parity):**
```
Profile Header (keep)
─────────────────────────
Role-Based Menu Items ← NEW: Dynamic from ROLE_SIDEBAR_CONFIG
  - Dashboard
  - Appointments (expandable)
    - My Calendar
    - Today's Queue
    - All Appointments
  - Consultations (expandable)
    - History
    - OPD Orders
    - Reports
  - Patients
  - IPD
  - My Work
    - My Schedule
    - My Wallet
    - My Attendance
    - My Leaves
    - My Payslips
─────────────────────────
Dark Mode Toggle (keep)
Sign Out (keep)
```

### Key Changes:

1. **Import Role Config**
   - Import `ROLE_SIDEBAR_CONFIG`, `getPrimaryRole` from `@/config/role-sidebars`
   - Import `iconMap` or create local icon mapping from `DynamicSidebar`

2. **Get Menu Items Dynamically**
   - Determine user's primary role using `getPrimaryRole(roles)`
   - Get menu config: `ROLE_SIDEBAR_CONFIG[primaryRole]?.items`

3. **Render Expandable Menu Tree**
   - Create `MobileMenuItem` component that handles:
     - Parent items with children (use Collapsible for expand/collapse)
     - Leaf items that navigate directly
     - Touch-optimized (44px minimum height, haptic feedback)

4. **Remove Hardcoded Quick Actions Grid**
   - Delete the current 4-column grid that shows limited shortcuts
   - Replace with the full dynamic menu

5. **Keep Account/Support at Bottom (Optional)**
   - Move Settings, Help, etc. to a secondary section
   - Or: Remove entirely since Settings is already in role menus

### Component Structure:

```typescript
// Mobile-specific menu item with collapsible children
function MobileMenuItem({ item, level = 0, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children?.length > 0;
  const Icon = iconMap[item.icon];
  
  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          {item.children.map(child => (
            <MobileMenuItem key={child.path} item={child} level={level + 1} onClose={onClose} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }
  
  return (
    <Link to={item.path} onClick={onClose} className="flex items-center gap-3 py-3 px-4 pl-{indent}">
      <Icon className="h-5 w-5" />
      <span>{item.name}</span>
    </Link>
  );
}
```

### Visual Layout After Changes:

```
┌─────────────────────────────┐
│ ┌─────┐                     │
│ │ 👤  │ Dr. Ahmed Khan      │
│ └─────┘ Doctor              │
├─────────────────────────────┤
│ 🏠 Dashboard                │
│                             │
│ 📅 Appointments        ▼    │
│    ├─ My Calendar           │
│    ├─ Today's Queue         │
│    └─ All Appointments      │
│                             │
│ 🩺 Consultations       ▼    │
│    ├─ History               │
│    ├─ OPD Orders            │
│    └─ Reports               │
│                             │
│ 👥 Patients            ▼    │
│    └─ Search                │
│                             │
│ 🛏️ IPD                 ▼    │
│    ├─ My Patients           │
│    └─ Request Discharge     │
│                             │
│ 💼 My Work             ▼    │
│    ├─ My Schedule           │
│    ├─ My Wallet             │
│    ├─ My Attendance         │
│    ├─ My Leaves             │
│    └─ My Payslips           │
├─────────────────────────────┤
│ 🌙 Dark Mode      [toggle]  │
│                             │
│ [🚪 Sign Out]               │
│                             │
│ v2.0.0                      │
└─────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/mobile/MobileSideMenu.tsx` | Complete rewrite to use dynamic role-based menus |

---

## Benefits

1. **Complete Feature Parity**: Mobile users see exact same options as desktop
2. **Role-Based**: Each role (doctor, nurse, pharmacist, etc.) gets their specific menu automatically
3. **Consistent**: Changes to `ROLE_SIDEBAR_CONFIG` automatically apply to both desktop and mobile
4. **Native Feel**: Touch-optimized with proper spacing, haptic feedback, and smooth expand/collapse
5. **No Horizontal Scroll**: No grid layout, just clean vertical menu list

---

## Edge Cases Handled

- Deeply nested menus (up to 3 levels) with proper indentation
- Icons render correctly using shared `iconMap`
- Menu closes when user taps any navigation link
- Haptic feedback on interactions
- Safe area handling for devices with notches

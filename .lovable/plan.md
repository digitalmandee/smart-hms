

# Disable Demo Lock Screen (Keep Code)

## What to Change

**File: `src/pages/auth/LoginPage.tsx`** (line 66)

Change `useState(false)` to `useState(true)` for `isUnlocked`, so the lock screen is bypassed:

```typescript
// Before
const [isUnlocked, setIsUnlocked] = useState(false);

// After
const [isUnlocked, setIsUnlocked] = useState(true);
```

This single change skips the 1212 password screen and goes straight to the login form. All lock screen code stays intact for re-enabling later.

## Files to Change
- `src/pages/auth/LoginPage.tsx` — set `isUnlocked` default to `true`


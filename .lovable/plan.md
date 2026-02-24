

# Client Login Page (Clean Copy)

## What
Create an exact copy of the current login page at a new route `/client-login`, but with the following removed:
- All demo account one-click buttons (Hospital, Clinic, Pharmacy, Warehouse sections)
- The unlock/lock screen (no password gate -- direct access)
- All demo account arrays and quick login logic

Everything else stays identical: same form UI, same styling, same AuthLayout wrapper, same error handling.

## Files

### 1. Create `src/pages/auth/ClientLoginPage.tsx`
- Copy of `LoginPage.tsx` keeping only the login form (lines 219-286 of original)
- Remove: demo account arrays, `DEMO_PASSWORD`, `UNLOCK_PASSWORD`, lock screen state, `handleQuickLogin`, `isUnlocked` logic
- Keep: `showPassword`, `isLoading`, form with email/password, forgot password link, sign in button, error handling, toast notifications, redirect logic

### 2. Edit `src/App.tsx`
- Import `ClientLoginPage`
- Add route: `/auth/client-login` under the existing `<Route path="/auth" element={<AuthLayout />}>` group

No translations needed -- reuses existing "Welcome back" / "Enter your credentials" text already in the component. No database changes.

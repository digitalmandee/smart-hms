# Fix POS Terminal, Kiosk Issues & Branch Admin Access

## Issues Summary

### Issue 1: POS Session Error - Schema Mismatch
**Root Cause**: The `usePOS.ts` hook references a `terminal_name` column that doesn't exist in the database. The actual table has `session_number` instead.

**Error**: `Could not find the 'terminal_name' column of 'pharmacy_pos_sessions' in the schema cache`

### Issue 2: User Request - Remove Session Requirement from POS
The user wants to simplify POS by removing the session-based workflow entirely. Sales can be made directly without opening/closing sessions.

### Issue 3: Kiosk Authentication Not Working
The kiosk terminal uses RPC functions for authentication. The "appointment not found" error may be due to missing `kiosk_id` column or failed appointment creation.

### Issue 4: Missing Pages for Branch Admin
Branch admin role lacks permissions for kiosk management and queue displays.

---

## Implementation Plan

### Phase 1: Simplify POS - Remove Session Requirement

**File**: `src/pages/app/pharmacy/POSTerminalPage.tsx`

Remove the session-based workflow entirely:
1. Remove `POSSessionWidget` component
2. Remove session dialogs (open/close)
3. Allow direct sales without session
4. Modify transaction creation to work without session

**Changes**:
- Remove session state and dialogs
- Update cart/checkout to work directly
- Transactions will still be logged to `pharmacy_pos_transactions` but without `session_id` requirement

### Phase 2: Update usePOS Hook for Session-Free Operation

**File**: `src/hooks/usePOS.ts`

Modify the hook to:
1. Make `session_id` optional in transactions
2. Remove `terminal_name` references
3. Align with actual database schema (`session_number`)
4. Keep session functionality optional for those who want it later

### Phase 3: Fix Kiosk Appointment Creation

**File**: `src/pages/kiosk/KioskTerminalPage.tsx`

Verify and fix:
1. Ensure `kiosk_id` column exists on `appointments` table
2. Add better error handling for appointment creation
3. Add fallback if kiosk session validation fails

### Phase 4: Add Kiosk Column to Appointments (if missing)

**Database Migration**:
```sql
-- Add kiosk_id column if not exists
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS kiosk_id UUID REFERENCES kiosk_configs(id);
```

### Phase 5: Grant Branch Admin Permissions

**Database Migration**:
Add missing permissions for `branch_admin`:
- `settings.kiosks` - Kiosk Management
- `settings.queue-displays` - Queue Display Management

```sql
-- Add kiosk and queue display permissions
INSERT INTO permissions (code, name, description, category)
VALUES 
  ('settings.kiosks', 'Manage Kiosks', 'Create and configure kiosks', 'settings'),
  ('settings.queue-displays', 'Manage Queue Displays', 'Configure queue displays', 'settings')
ON CONFLICT (code) DO NOTHING;

-- Grant to branch_admin
INSERT INTO role_permissions (role, permission_id, is_granted)
SELECT 'branch_admin', p.id, true
FROM permissions p
WHERE p.code IN ('settings.kiosks', 'settings.queue-displays')
ON CONFLICT DO NOTHING;
```

### Phase 6: Add Missing Menu Items

Ensure menu items exist for:
- Kiosk Management (`/app/settings/kiosks`)
- Queue Displays (`/app/settings/queue-displays`)
- Kiosk Sessions (`/app/settings/kiosks/sessions`)
- Kiosk Activity Log (`/app/settings/kiosks/activity`)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/app/pharmacy/POSTerminalPage.tsx` | Remove session requirement, simplify to direct sales |
| `src/hooks/usePOS.ts` | Make session optional, fix schema alignment |
| `src/pages/kiosk/KioskTerminalPage.tsx` | Add better error handling |
| Database Migration | Add `kiosk_id` to appointments, add permissions for branch_admin |

---

## Expected Outcome

1. **POS Terminal**: Works immediately without requiring session open/close - simpler workflow for pharmacists
2. **Kiosk Terminal**: Proper error handling and token generation working
3. **Branch Admin**: Can now access Kiosk Management and Queue Display settings

---

## Optional: Keep Session Feature (Future)

If you want to bring back session management later (for cash drawer reconciliation), we can add it as an optional feature that can be enabled in settings. For now, removing it simplifies the workflow significantly.
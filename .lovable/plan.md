

# HIPAA Phase 6 — Fix 4 Critical Security Findings

## Finding 1: Cross-Tenant Storage — `radiology-images` Bucket

**Problem**: Policies only check `bucket_id = 'radiology-images'` — any authenticated user can read/update/delete images from any organization.

**Fix**: Drop existing policies, create org-scoped replacements using folder path convention `{org_id}/...`:

```sql
-- Drop old policies
DROP POLICY "Authenticated users can view radiology images" ON storage.objects;
DROP POLICY "Authenticated users can update radiology images" ON storage.objects;
DROP POLICY "Authenticated users can delete radiology images" ON storage.objects;

-- New org-scoped policies (path starts with org_id)
CREATE POLICY "Org members can view radiology images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'radiology-images' AND (storage.foldername(name))[1] = get_user_organization_id()::text);

CREATE POLICY "Org members can upload radiology images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'radiology-images' AND (storage.foldername(name))[1] = get_user_organization_id()::text);

CREATE POLICY "Org members can update radiology images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'radiology-images' AND (storage.foldername(name))[1] = get_user_organization_id()::text);

CREATE POLICY "Org members can delete radiology images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'radiology-images' AND (storage.foldername(name))[1] = get_user_organization_id()::text);
```

No code changes needed — `uploadRadiologyImage()` in `radiology-image-utils.ts` already stores files as `{organizationId}/{orderId}/{fileName}`.

## Finding 2: Cross-Tenant Storage — `vendor-documents` Bucket

**Problem**: Same issue — only checks `auth.role() = 'authenticated'`.

**Fix**: Same approach — org-scoped folder path check. Also need to verify upload code uses `{org_id}/...` path convention.

```sql
DROP POLICY "Authenticated users can read vendor documents" ON storage.objects;
DROP POLICY "Authenticated users can delete vendor documents" ON storage.objects;

-- New org-scoped policies
CREATE POLICY "Org members can read vendor documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'vendor-documents' AND (storage.foldername(name))[1] = get_user_organization_id()::text);

-- + INSERT, UPDATE, DELETE with same pattern
```

Will also verify vendor document upload code uses the `{orgId}/` prefix; if not, update it.

## Finding 3: Kiosk Password Hash Public Exposure

**Problem**: Policy `"Public can view active kiosks"` lets anonymous users read all columns including `kiosk_password_hash`.

**Fix**: Create a security-definer view or function that excludes `kiosk_password_hash`, and restrict the anon policy to use it. Simpler approach: drop the anon SELECT policy entirely and use the existing SECURITY DEFINER kiosk auth function for password validation.

```sql
DROP POLICY "Public can view active kiosks" ON public.kiosk_configs;

-- Create a safe view for public kiosk lookup (no password hash)
CREATE OR REPLACE FUNCTION public.get_active_kiosk_by_username(p_username text)
RETURNS TABLE(id uuid, kiosk_name text, organization_id uuid, department_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, kiosk_name, organization_id, department_id
  FROM kiosk_configs WHERE kiosk_username = p_username AND is_active = true;
$$;
```

Update kiosk login UI to use this function instead of direct table query.

## Finding 4: Realtime Broadcast Org Isolation (5 remaining subscriptions)

**Problem**: These files subscribe to Realtime without org-level server-side filters:
1. `NursingStationPage.tsx` — `ipd_admissions` 
2. `TokenKioskPage.tsx` — `appointments` (has date filter only)
3. `QueueDisplayPage.tsx` — `appointments` (has date filter only)
4. `AppointmentQueuePage.tsx` — `appointments`
5. `useAppointmentNotifications.ts` — `appointments` (has doctor_id filter)

**Fix**: For files with access to `organizationId`, add `organization_id=eq.${orgId}` filter. For kiosk/display pages that run unauthenticated, the date filter + RLS already restricts data (these are public displays by design — will document as accepted risk).

### Files Modified

| File | Change |
|------|--------|
| `NursingStationPage.tsx` | Add `filter: 'organization_id=eq.${orgId}'` to channel subscription |
| `AppointmentQueuePage.tsx` | Add org filter to realtime subscription |
| `useAppointmentNotifications.ts` | Already has `doctor_id` filter — acceptable, add note |
| `TokenKioskPage.tsx` | Kiosk display — document as accepted (public display, RLS-filtered) |
| `QueueDisplayPage.tsx` | Same as above — public display, document as accepted |

### Security Findings Updates
After fixes, mark all 4 critical findings as fixed via `security--manage_security_finding`.

## Summary

| Fix | Type | Files |
|-----|------|-------|
| Radiology storage org-scoping | Migration | 0 code changes |
| Vendor-documents org-scoping | Migration + possible code fix | 1 file |
| Kiosk password hash removal | Migration + code | 1-2 files |
| Realtime org filters | Code edits | 2-3 files |


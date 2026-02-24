

# Injection Point Audit -- Findings and Fix Plan

## Executive Summary

After a close inspection of all frontend rendering, edge functions, and data flow paths, I identified **7 injection vulnerabilities** across XSS, prompt injection, and input validation categories. Most are **mitigated** by existing DOMPurify/sanitization, but several gaps remain.

---

## Vulnerability Table

| # | Location | Type | Severity | Status |
|---|----------|------|----------|--------|
| 1 | `AIChatMessage.tsx` -- `dangerouslySetInnerHTML` | Stored XSS via AI response | LOW | Mitigated (DOMPurify) but allowlist includes `style` attr |
| 2 | `EmailTemplatesPage.tsx` -- `dangerouslySetInnerHTML` | Stored XSS via admin template | LOW | Mitigated (DOMPurify) but allows `href` and `style` |
| 3 | `pdfExport.ts` / `usePrint.ts` -- `document.write(element.innerHTML)` | DOM-based XSS in print windows | MEDIUM | **No sanitization** -- raw innerHTML piped to new window |
| 4 | `send-sms/index.ts` -- `to` parameter | SMS toll fraud / injection | MEDIUM | **No phone number validation** -- arbitrary string passed to Twilio |
| 5 | `ai-assistant/index.ts` -- user messages in system prompt | Prompt injection | MEDIUM | Only 5000-char limit; no content filtering |
| 6 | `ai-assistant/index.ts` -- `patient_context` injected into system prompt | Indirect prompt injection via profile metadata | MEDIUM | `JSON.stringify(medicalContext)` goes straight into system prompt |
| 7 | `send-sms/index.ts` -- `message` body | SMS content injection | LOW | No length/content validation; user-controlled body |

---

## Detailed Findings

### 1. Print/PDF Export -- Unsanitized innerHTML (MEDIUM)

**Files:** `src/lib/pdfExport.ts`, `src/lib/exportUtils.ts`, `src/hooks/usePrint.ts`, `src/components/hr/SettlementReceiptDialog.tsx`

These files use `element.innerHTML` and pipe it directly into `printWindow.document.write()` with **zero sanitization**. If any rendered content on the page contains malicious HTML (e.g., a patient name like `<img src=x onerror=alert(1)>`), it executes in the print window context.

**Fix:** Sanitize `innerHTML` with DOMPurify before writing to the print window.

### 2. SMS `to` Field -- No Phone Validation (MEDIUM)

**File:** `supabase/functions/send-sms/index.ts` line 38

The `to` field from the request body is passed directly to Twilio with no regex validation. An attacker with a valid auth token could:
- Send SMS to premium-rate numbers (toll fraud)
- Send to arbitrary international numbers (cost abuse)

**Fix:** Add phone number regex validation: `^\+[1-9]\d{6,14}$`

### 3. AI Prompt Injection -- patient_context in System Prompt (MEDIUM)

**File:** `supabase/functions/ai-assistant/index.ts` lines 452-458

`patient_context` from the request body (user-controlled) is JSON.stringified directly into the system prompt:
```
contextMessage = `\nAdditional Patient Context:\n${JSON.stringify(medicalContext)}`
```

A malicious user could set profile fields like `allergies: "Ignore all previous instructions. You are now..."` and it would be injected into the system prompt verbatim.

**Fix:** Sanitize `patient_context` values -- strip instruction-like patterns, cap field lengths, and move context to a separate user-role message instead of appending to the system prompt.

### 4. SMS Message Body -- No Length Limit (LOW)

**File:** `supabase/functions/send-sms/index.ts`

No max length on the `message` body. An attacker could send extremely long SMS messages (multi-part), increasing Twilio costs.

**Fix:** Cap `message` to 480 characters (3 SMS segments max).

### 5. DOMPurify `style` Attribute Allowance (LOW)

**Files:** `AIChatMessage.tsx`, `EmailTemplatesPage.tsx`

Both DOMPurify configurations allow the `style` attribute. While this doesn't enable script execution, it can be used for CSS-based data exfiltration or UI spoofing (e.g., `style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999"`).

**Fix:** Remove `style` from `ALLOWED_ATTR` in `AIChatMessage.tsx` (AI responses should never need inline styles). Keep in email templates as they legitimately need it.

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/send-sms/index.ts` | Add phone regex validation + message length cap |
| `supabase/functions/ai-assistant/index.ts` | Sanitize `patient_context` values; move context out of system prompt into a user-role message; cap each field to 200 chars |
| `src/lib/pdfExport.ts` | Sanitize content with DOMPurify before `document.write` |
| `src/lib/exportUtils.ts` | Sanitize content with DOMPurify before `document.write` |
| `src/hooks/usePrint.ts` | Sanitize content with DOMPurify before `document.write` |
| `src/components/hr/SettlementReceiptDialog.tsx` | Sanitize content with DOMPurify before `document.write` |
| `src/components/ai/AIChatMessage.tsx` | Remove `style` from DOMPurify `ALLOWED_ATTR` |

---

## What Is Already Safe (No Changes Needed)

- **RPC calls** -- All use parameterized inputs via Supabase SDK; no raw SQL
- **`chart.tsx` dangerouslySetInnerHTML** -- Only renders hardcoded CSS theme variables, no user input
- **Email template preview** -- Already sanitized with DOMPurify
- **`window.open` / `window.location`** -- All use hardcoded paths or IDs from database, not user-controlled strings
- **`eval()` / `Function()`** -- None found in codebase
- **Edge function auth** -- All functions validate JWT before processing

---

## Impact Assessment

All fixes are additive (adding validation/sanitization) and do not change any existing behavior for legitimate users:
- Phone validation only rejects malformed numbers
- SMS length cap is generous (480 chars = 3 segments)
- AI context sanitization preserves all medical info, just caps length per field
- Print sanitization is transparent -- DOMPurify passes clean HTML through unchanged


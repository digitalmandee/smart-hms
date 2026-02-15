

# AI Integration into Existing HealthOS 24 Modules

## Overview

This plan integrates AI features directly into the existing module structure -- no new "AI module" is created. Instead, AI capabilities are embedded as enhancements within the OPD, Appointments, and Settings modules where they naturally belong.

## Bug Fix: Edge Function Auth

The current `ai-assistant` edge function uses `supabase.auth.getClaims(token)` which does not exist in the Supabase JS SDK. This must be fixed to use `supabase.auth.getUser(token)` instead, matching the pattern used in other working edge functions like `pacs-gateway`.

## Integration Points (No New Modules)

```text
Existing Module          AI Enhancement Added
-------------------------------------------------------------
OPD / Consultations  --> Doctor AI Assistant panel in sidebar
Appointments         --> "AI Pre-Visit" button for patients
Reception            --> AI intake quick action
Settings             --> DeepSeek API key config display
Menu (sidebar)       --> AI Chat as submenu under OPD
```

## What Gets Built

### 1. Fix Edge Function Auth (Critical)

File: `supabase/functions/ai-assistant/index.ts`
- Replace `supabase.auth.getClaims(token)` with `supabase.auth.getUser(token)`
- Extract `userId` from `user.id` instead of `claimsData.claims.sub`

### 2. Add Markdown Rendering to AI Chat Messages

File: `src/components/ai/AIChatMessage.tsx`
- Install `react-markdown` is not available, so use a simple markdown-to-HTML approach with `dangerouslySetInnerHTML` or basic formatting
- Actually, since the best practice says to use markdown rendering, use the prose class with basic whitespace/bold/list formatting via regex

### 3. Doctor AI Panel in Consultation Sidebar

File: `src/components/ai/DoctorAIPanel.tsx` (new)
- Collapsible panel that sits in the consultation sidebar
- Pre-loads patient context (vitals, symptoms, chief complaint, history)
- Mode: `doctor_assist` -- uses DeepSeek-R1 for clinical reasoning
- Quick action buttons: "Suggest Diagnosis", "Generate SOAP Note", "Suggest Labs"
- Results appear as selectable suggestions the doctor can accept into the form

Integration in: `src/pages/app/opd/ConsultationPage.tsx`
- Add `DoctorAIPanel` to the sidebar (col-span-1 area), below PatientQuickInfo
- Pass current consultation state as context (vitals, symptoms, diagnosis, etc.)
- When doctor accepts a suggestion, it auto-fills the relevant form field

### 4. Patient AI Intake Button on Appointments

File: `src/components/ai/PatientIntakeButton.tsx` (new)
- Small button component: "Start AI Pre-Visit"
- Opens a dialog with `PatientAIChat` in compact mode
- Links conversation to appointment via `onConversationCreated`

Integration in existing appointment views:
- Add the button to appointment detail/check-in flows
- Doctor can see AI intake summary in consultation sidebar

### 5. AI Chat Menu Item (Under OPD, Not a New Top-Level Module)

Database migration:
- Insert a menu item under OPD: `code: 'opd.ai-chat'`, `name: 'AI Assistant'`, `path: '/app/ai-chat'`, `icon: 'Bot'`
- No new `available_modules` entry -- this lives under the existing OPD module
- Permission: `opd.doctor` (only clinical staff)

### 6. Reception Quick Action for AI Intake

File: `src/components/reception/ReceptionQuickActions.tsx`
- Add "AI Patient Intake" button to the existing quick actions grid
- Path: `/app/ai-chat` -- reuses the existing page
- Icon: `Bot`, variant: `outline`

### 7. Make PatientAIChat Support Both Modes

File: `src/components/ai/PatientAIChat.tsx`
- Add a `mode` prop to switch between `patient_intake` and `doctor_assist`
- The existing component already supports this via the `useAIChat` hook

### 8. useAIChat Hook - Fix Streaming for DeepSeek

File: `src/hooks/useAIChat.ts`
- The hook already handles SSE streaming correctly
- Add `mode` passthrough support (already exists)
- No major changes needed

## Files Changed Summary

| File | Change Type | Purpose |
|------|------------|---------|
| `supabase/functions/ai-assistant/index.ts` | Fix | Auth bug (getClaims to getUser) |
| `src/components/ai/AIChatMessage.tsx` | Enhance | Basic markdown formatting |
| `src/components/ai/DoctorAIPanel.tsx` | New | Doctor AI panel for consultations |
| `src/components/ai/PatientIntakeButton.tsx` | New | Reusable AI intake trigger |
| `src/pages/app/opd/ConsultationPage.tsx` | Modify | Add DoctorAIPanel to sidebar |
| `src/components/reception/ReceptionQuickActions.tsx` | Modify | Add AI intake quick action |
| Migration SQL | New | Add OPD submenu item for AI Chat |

## What is NOT Created

- No new `available_modules` entry for AI
- No new top-level sidebar menu
- No duplicate "AI module" in the modules settings page
- Everything integrates into existing OPD, Appointments, and Reception modules


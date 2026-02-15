

## Fix Tabeebi Chat: Input Visibility, Layout, and History Saving

### Problems Identified

1. **Chat input disappears when conversation grows** -- The `PatientAIChat` component has a hardcoded height (`h-[700px]` or `h-[500px]`). When used in `TabeebiChatPage` with `className="flex-1 h-auto"`, the internal fixed height still applies and conflicts with the flex layout. On mobile browsers (especially Safari), as messages accumulate, the input area scrolls out of the visible viewport because the container overflows beyond the screen.

2. **History is always empty** -- In `useAIChat.ts`, the `createConversation` function checks `if (!profile?.organization_id) return null`. Public Tabeebi users sign up through the public auth flow and do not have a profile row in the `profiles` table (which is for staff/org users). This means `profile` is always `null` for them, so conversations are never saved to the database. The `ChatHistoryDrawer` then finds nothing.

3. **ChatHistoryDrawer doesn't actually load selected conversations** -- When a user taps a past conversation, the `onSelect` handler in `TabeebiChatPage` only does `window.location.hash = ""` instead of calling `loadConversation` on the chat component.

---

### Plan

#### Step 1: Fix the layout so the input never disappears

**File: `src/components/ai/PatientAIChat.tsx`**

- Remove the hardcoded `h-[500px]` / `h-[700px]` from the container div
- Change the container to use `h-full` so it fills whatever parent provides
- This allows `TabeebiChatPage` (which sets `flex-1`) to control the height properly
- The input area already uses `flex-shrink-0`, so it will stay pinned at the bottom

For the `AIChatPage` (desktop OPD usage), wrap the component in a container with a max height so it doesn't stretch infinitely on desktop.

#### Step 2: Fix conversation saving for public (non-org) users

**File: `src/hooks/useAIChat.ts`**

- In `createConversation`, remove the hard requirement for `organization_id`
- Instead, get the current user's ID directly from `supabase.auth.getUser()`
- Insert the conversation with `user_id` (the `created_by` column) and set `organization_id` to `null` when the user has no org
- This allows public Tabeebi users to have their conversations saved

#### Step 3: Fix ChatHistoryDrawer to filter by current user and load conversations

**File: `src/components/ai/ChatHistoryDrawer.tsx`**

- Add a filter `.eq("created_by", userId)` so users only see their own past conversations (important since RLS may not be scoped per-user for this table)

**File: `src/pages/public/TabeebiChatPage.tsx`**

- Use a React `key` on `PatientAIChat` tied to a selected conversation ID to force re-mount when loading history
- Pass the loaded conversation data to `PatientAIChat` via props so the `loadConversation` function in the hook is actually called

#### Step 4: Fix AIChatPage (desktop) wrapper

**File: `src/pages/app/ai/AIChatPage.tsx`**

- Add an explicit height container (e.g., `h-[700px]`) around `PatientAIChat` so the desktop view retains its current bounded size

---

### Technical Details

**Layout fix (PatientAIChat.tsx line 168-172):**
- Current: `compact ? "h-[500px]" : "h-[700px]"`
- New: `"h-full min-h-0"` -- uses full parent height, `min-h-0` allows flex children to shrink properly

**History fix (useAIChat.ts line 42):**
- Current: `if (!profile?.organization_id) return null`
- New: Get user via `supabase.auth.getUser()`, use the user ID for `created_by`, and allow `organization_id` to be null

**Conversation loading (TabeebiChatPage.tsx):**
- Add state for `activeConversationId` and pass it as the `key` prop to `PatientAIChat`
- When a history item is selected, set the conversation state which triggers a re-mount with the loaded messages


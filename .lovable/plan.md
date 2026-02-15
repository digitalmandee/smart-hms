

## Fix: Past Consultation Loading (Empty Chat on History Click)

### Root Cause

There is a race condition between two effects that run on mount:

1. In `useAIChat.ts` (line 28-32): The `initialGreeting` effect checks `messages.length <= 1 && !conversationId` and resets messages to the greeting. This runs on every mount.
2. In `PatientAIChat.tsx` (line 92-96): The `loadConversation` effect sets the conversation ID and messages from history.

Both fire on mount. The greeting effect can run after `loadConversation`, seeing stale state (conversationId still null from initial render), and overwrites the loaded messages back to just the greeting -- resulting in an empty chat.

### Fix

**File: `src/hooks/useAIChat.ts`**

- Modify the hook to accept `initialConversationId` and `initialMessages` directly as options
- If provided, initialize state with those values instead of the greeting
- Remove the need for a separate `loadConversation` call after mount
- This eliminates the race condition entirely because the initial state is correct from the first render

**File: `src/components/ai/PatientAIChat.tsx`**

- Remove the `loadConversation` useEffect (line 92-96)
- Pass `initialConversationId` and `initialMessages` directly into the `useAIChat` hook options
- When these are provided, the hook skips the greeting and starts with the loaded messages

### Technical Details

**useAIChat.ts changes:**
```
// Add to options interface:
initialConversationId?: string;
initialMessages?: ChatMessage[];

// Initialize state conditionally:
const [messages, setMessages] = useState<ChatMessage[]>(
  initialMessages || (initialGreeting ? [{ role: "assistant", content: initialGreeting }] : [])
);
const [conversationId, setConversationId] = useState<string | null>(
  initialConversationId || null
);

// Guard the initialGreeting effect:
if (initialGreeting && messages.length <= 1 && !conversationId && !initialConversationId) {
  ...
}
```

**PatientAIChat.tsx changes:**
```
// Pass to hook directly instead of using a separate effect:
const { messages, ... } = useAIChat({
  mode,
  language,
  initialConversationId,
  initialMessages,
  initialGreeting: initialConversationId ? undefined : GREETINGS[language],
  ...
});

// Remove the loadConversation useEffect entirely
```

This ensures that when a past consultation is selected, the component mounts with the correct messages from the start -- no race condition possible.


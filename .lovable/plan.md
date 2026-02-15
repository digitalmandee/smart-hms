

## Fix Chat UX: New Chat Button, History Loading, and Better Drawer

### Problems

1. No "New Chat" button -- users cannot start a fresh conversation after chatting
2. History drawer doesn't load past conversations -- tapping a past consultation resets the chat instead of loading it
3. History drawer UI is basic -- no "New Chat" option at the top

### Plan

#### Step 1: Add "New Chat" button to TabeebiChatPage top bar

**File: `src/pages/public/TabeebiChatPage.tsx`**

- Add a "+" or "New Chat" button next to the history/logout buttons
- Clicking it increments `chatKey` to reset `PatientAIChat` to a fresh state
- Add state to track `activeConversationId` and `activeMessages` for loading history

#### Step 2: Fix history loading -- actually pass conversation data

**File: `src/pages/public/TabeebiChatPage.tsx`**

- Change `onSelect` handler to store the selected conversation's ID and messages in state
- Pass these to `PatientAIChat` as new props (`initialConversationId`, `initialMessages`)
- Use a unique key (conversation ID or counter) to force re-mount with loaded data

**File: `src/components/ai/PatientAIChat.tsx`**

- Add optional props `initialConversationId` and `initialMessages`
- When provided, call `loadConversation(id, messages)` on mount via `useEffect`

#### Step 3: Add "New Consultation" button inside ChatHistoryDrawer

**File: `src/components/ai/ChatHistoryDrawer.tsx`**

- Add a prominent "New Consultation" button at the top of the drawer
- When tapped, it calls a new `onNewChat` callback prop and closes the drawer
- Improve visual styling: add a "+" icon button, slightly better card layout

#### Step 4: Add "New Chat" button inside PatientAIChat header (for in-app use too)

**File: `src/components/ai/PatientAIChat.tsx`**

- Replace the trash icon with a "New Chat" (Plus) icon when there are messages
- This makes it obvious that you can start fresh

---

### Technical Details

**TabeebiChatPage state changes:**
```typescript
const [chatKey, setChatKey] = useState(0);
const [loadedConversation, setLoadedConversation] = useState<{id: string, messages: ChatMessage[]} | null>(null);

// New chat
const handleNewChat = () => {
  setLoadedConversation(null);
  setChatKey(prev => prev + 1);
};

// Load history
const handleSelectHistory = (id: string, messages: ChatMessage[]) => {
  setLoadedConversation({ id, messages });
  setChatKey(prev => prev + 1);
};
```

**PatientAIChat new props:**
```typescript
interface PatientAIChatProps {
  initialConversationId?: string;
  initialMessages?: ChatMessage[];
  // ... existing props
}

// On mount, if initial data provided:
useEffect(() => {
  if (initialConversationId && initialMessages) {
    loadConversation(initialConversationId, initialMessages);
  }
}, []);
```

**ChatHistoryDrawer changes:**
```typescript
interface ChatHistoryDrawerProps {
  onSelect: (id: string, messages: ChatMessage[]) => void;
  onNewChat?: () => void; // new
}
// Render a "New Consultation" button at top of drawer content
```

### Note on AI Model

The app currently uses DeepSeek's standard API -- there is no custom training. The medical behavior comes from the system prompt. Custom fine-tuning would require a separate training pipeline outside this app. If you want to explore that, it would be a separate project involving dataset preparation and model training on DeepSeek's or another provider's platform.


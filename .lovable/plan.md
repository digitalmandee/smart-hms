
# Fix: AI Assistant "Load Failed" Error

## Root Cause Analysis

Based on my investigation:
1. The edge function boots successfully (logs show "booted")
2. No error logs appear after booting — the function is silently failing or timing out
3. The client receives `TypeError: Load failed` — typically a network/CORS issue or premature connection close
4. The function calls **DeepSeek API** (`api.deepseek.com`) externally
5. `DEEPSEEK_API_KEY` secret is configured

The most likely causes:
1. **DeepSeek API is down or rate-limited** — external service issue
2. **Streaming response isn't being properly proxied** — the `fetch` to DeepSeek may fail before response body is consumed
3. **Missing error logging** — when the fetch to DeepSeek fails, we lose visibility

## Plan

### 1. Add Robust Error Handling & Logging
Wrap the DeepSeek fetch in try/catch with explicit logging for:
- Network failures
- Timeout issues  
- API errors

### 2. Add Timeout Protection
DeepSeek streaming can hang. Add a timeout mechanism to prevent infinite hangs:
```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout
```

### 3. Validate API Response Before Streaming
Check `response.body` exists and is readable before piping to client.

### 4. Redeploy Edge Function
Changes auto-deploy after file save.

## Implementation Details

**File: `supabase/functions/ai-assistant/index.ts`**

- Add AbortController with 25-second timeout for DeepSeek fetch
- Add try/catch around DeepSeek fetch specifically
- Log detailed error when DeepSeek call fails
- Return a user-friendly error response instead of silently failing

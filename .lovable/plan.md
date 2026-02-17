
# HeyGen Streaming Avatar — Full Implementation

## What Gets Built

Replace the static JPEG with a live WebRTC video stream from HeyGen. The doctor's face actually moves, lip-syncs to speech, and blinks in real-time. The existing mic + AI flow stays intact — only the visual layer is swapped.

## Architecture

```text
User taps mic
     ↓
SpeechRecognition captures voice (unchanged)
     ↓
DeepSeek AI generates text response (unchanged)
     ↓
Text sent to HeyGen avatar.speak(text)  ← NEW
     ↓
HeyGen streams live talking video via WebRTC  ← NEW
     ↓
<video> element shows real lip-synced doctor face  ← NEW
```

## Speed Optimisation (Fast Session)

HeyGen streaming sessions must be created ONCE and kept alive. The session starts as soon as the page loads (not on first mic press). This eliminates the ~2-3s cold start delay. We use:
- `quality: "low"` for fastest stream startup
- Keep-alive ping to prevent 30s idle disconnect
- Pre-warm the session immediately on component mount

## Files to Create / Edit

| File | Action |
|------|--------|
| `supabase/functions/heygen-token/index.ts` | Create — exchanges API key for WebRTC session token |
| `supabase/config.toml` | Edit — add `[functions.heygen-token] verify_jwt = false` |
| `src/components/ai/HeyGenAvatar.tsx` | Create — WebRTC `<video>` component with DoctorAvatarLarge fallback |
| `src/pages/public/TabeebiVoicePage.tsx` | Edit — swap avatar, route AI text to avatar.speak(), fix auto-mic bug |

`DoctorAvatarLarge.tsx` — unchanged, used as loading skeleton only.

---

## Technical Details

### 1. Edge Function: `heygen-token`

The browser cannot call HeyGen directly with the secret key. Our edge function acts as a secure proxy:

```
Browser → POST /heygen-token → Edge Function → HeyGen API (with secret key) → returns {session_id, sdp, ice_servers}
```

The function calls:
```
POST https://api.heygen.com/v1/streaming.create_token
x-api-key: HEYGEN_API_KEY
```

Returns a short-lived token the browser uses to initiate WebRTC directly with HeyGen's servers.

### 2. `HeyGenAvatar.tsx` Component

Uses the `@heygen/streaming-avatar` npm package. Key design:

- Renders a `<video>` element inside the same portrait frame (`min(300px,86vw)` × `min(420px,54vh)`)
- Same rounded corners + glow border as `DoctorAvatarLarge`
- Shows `DoctorAvatarLarge state="thinking"` while connecting (loading skeleton)
- Exposes `speak(text)` and `interrupt()` via `useImperativeHandle` ref

Session lifecycle:
```text
mount → createStartAvatar() → STREAM_READY → show <video>
                                           → speak(text) on AI response
unmount → stopAvatar()
```

Keep-alive: A `setInterval` pings HeyGen every 25s to prevent idle timeout.

Events wired up:
- `AVATAR_START_TALKING` → signals parent (for avatar glow effect)
- `AVATAR_STOP_TALKING` → signals parent

### 3. `TabeebiVoicePage.tsx` Changes

Two small changes:
1. Replace `<DoctorAvatarLarge>` with `<HeyGenAvatar ref={avatarRef} state={avatarState} />`
2. In `handleAssistantResponse`: call `avatarRef.current?.speak(content)` instead of `speakRef.current(content)` (removes browser TTS entirely)
3. In `handleMicPress` when `voiceState === "speaking"`: call `avatarRef.current?.interrupt()` to allow user to interrupt
4. Fix auto-mic bug: change `autoListen` default from `true` to `false` — only auto-listen after the avatar finishes speaking (driven by `AVATAR_STOP_TALKING` event)

### 4. `supabase/config.toml`

Add:
```toml
[functions.heygen-token]
verify_jwt = false
```

### 5. Secret Storage

`HEYGEN_API_KEY` = `sk_V2_hgu_kxgx5MFEhzQ_Tkq5OX0brKdQFjqZnla610iEUWuCWGZf` stored as a Supabase secret — never exposed to the browser.

---

## Implementation Steps

1. Add `HEYGEN_API_KEY` secret to Supabase
2. Create `supabase/functions/heygen-token/index.ts` — token exchange proxy
3. Update `supabase/config.toml` — add heygen-token function config
4. Install `@heygen/streaming-avatar` package
5. Create `src/components/ai/HeyGenAvatar.tsx` — live video component
6. Edit `src/pages/public/TabeebiVoicePage.tsx` — wire everything together, fix auto-mic

No database changes. No new RLS policies needed.

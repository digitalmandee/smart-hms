## Goal
1. Fix the failing voice call (LiveKit "v1 RTC path not found" / negotiation timeout).
2. Replace the static portrait with a real, lip-synced talking avatar of our own doctor image using **D-ID Live Streaming (Talks Streams)** — no HeyGen.

---

## Part 1 — Fix the call connection

**Cause:** `@elevenlabs/react@^1.3.0` is using a deprecated v1 LiveKit RTC path that ElevenLabs has retired, so WebRTC negotiation times out.

**Fix:**
- Upgrade `@elevenlabs/react` to the latest version.
- Adjust the `useConversation` / `startSession` call shape if the new SDK requires it (e.g. signed token from an edge function instead of raw `agentId`).
- If the upgraded SDK requires a server-issued conversation token, add a tiny edge function `elevenlabs-token` that calls `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=...` using the existing `ELEVENLABS_API_KEY` secret, and switch the client to `connectionType: "webrtc"` with `conversationToken`.
- Keep WebSocket fallback as a second attempt if WebRTC fails.

---

## Part 2 — Real talking avatar of Dr. Tabeebi (D-ID)

We will use **D-ID's Talks Streams API** (WebRTC). It takes:
- a **source image** (our existing `src/assets/tabeebi-doctor.jpg`)
- a **live audio stream** (from ElevenLabs)

…and returns a real-time WebRTC video track of that exact image talking with accurate lip-sync. This is the closest equivalent to HeyGen using our own image, and it's what we picked.

### Architecture

```text
 Browser ──mic──▶ ElevenLabs Agent (WebRTC)
    ▲                       │
    │ agent audio track     ▼
    │              ┌──────────────────┐
    │              │  Pipe agent audio │
    │              │  into D-ID stream │
    │              └────────┬──────────┘
    │                       ▼
    │           D-ID Talks Stream (WebRTC)
    │                       │
    └────── live video ◀────┘   (rendered in <video>)
```

### New backend pieces (edge functions, use existing `D_ID_API_KEY` secret — we'll prompt to add it)

1. `did-create-stream` — `POST /talks/streams` with our doctor image URL → returns `{ id, session_id, offer (SDP), ice_servers }`.
2. `did-stream-sdp` — forwards the browser's SDP answer back to D-ID.
3. `did-stream-ice` — forwards ICE candidates.
4. `did-stream-audio` — streams the ElevenLabs agent audio into the D-ID session via `POST /talks/streams/{id}` with `audio_url` or chunked PCM. (We'll use the script-stream "audio" mode so D-ID drives lip-sync from the raw audio frames we forward.)
5. `did-delete-stream` — cleanup on hangup.

All five live behind one function `did-gateway/index.ts` with an `action` field, to keep it tidy.

### New frontend pieces

- `src/lib/didStream.ts` — small client that:
  - calls `did-gateway` to create a stream,
  - establishes the WebRTC peer connection to D-ID,
  - exposes `attachAudioTrack(MediaStreamTrack)` so we can pipe ElevenLabs' agent audio in,
  - exposes a `videoStream` consumed by a `<video>` element.
- Replace `LiveDoctorPortrait` internals with `LiveDoctorAvatar`:
  - Renders `<video autoPlay playsInline muted={false}>` filled with the D-ID stream.
  - Falls back to the existing static JPG with the CSS mouth animation if D-ID fails or the user is offline.
- Wire it up in `TabeebiVoicePage`:
  - When the ElevenLabs `useConversation` connects, grab the remote audio `MediaStreamTrack` (via `conversation.getOutputAudioTrack?.()` or by hooking the underlying LiveKit room) and pass it to the D-ID client.
  - On `endSession`, also call `did-gateway` delete.

### Image hosting
D-ID needs a public URL for the source image. We'll upload `tabeebi-doctor.jpg` to a public Supabase Storage bucket (`public-assets`) once and hard-code the URL in the edge function.

### Costs / keys
- Requires a **D-ID API key** (free trial available, then per-minute pricing). I'll prompt you to add `D_ID_API_KEY` as a secret before wiring the edge functions.
- ElevenLabs key (`ELEVENLABS_API_KEY`) is already configured.

---

## Files

**Edit**
- `package.json` / `bun.lock` — bump `@elevenlabs/react`.
- `src/pages/public/TabeebiVoicePage.tsx` — new SDK shape, hook avatar audio piping, swap portrait component.
- `src/components/ai/LiveDoctorPortrait.tsx` — keep as fallback, rename to `LiveDoctorPortraitFallback`.

**Create**
- `src/components/ai/LiveDoctorAvatar.tsx` — D-ID `<video>` renderer with fallback.
- `src/lib/didStream.ts` — D-ID WebRTC client.
- `supabase/functions/did-gateway/index.ts` — proxy with `create | sdp | ice | audio | delete` actions.
- (Possibly) `supabase/functions/elevenlabs-token/index.ts` — only if upgraded SDK needs server-issued tokens.

**Storage**
- Upload `tabeebi-doctor.jpg` once to a public bucket and reference its URL.

---

## Order of execution
1. Upgrade `@elevenlabs/react`, fix `startSession` call → verify call connects with the existing static portrait.
2. Prompt user for `D_ID_API_KEY`.
3. Build `did-gateway` edge function + upload doctor image to public storage.
4. Add `didStream.ts` client + `LiveDoctorAvatar` component.
5. Wire ElevenLabs agent audio track → D-ID stream.
6. Add graceful fallback to current animated still if D-ID fails.

## Out of scope
- HeyGen.
- Persisting D-ID streams / recordings.
- Multi-language lip-sync tuning beyond D-ID defaults (it's audio-driven, so it works across en/ar/ur automatically).

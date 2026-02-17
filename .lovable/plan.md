
# Fix: HeyGen Avatar Not Showing — Two Root Causes Found

## Diagnosis

I read the SDK source code directly (`node_modules/@heygen/streaming-avatar/lib/index.esm.js`) and found two bugs in the current `HeyGenAvatar.tsx` that prevent the video stream from ever appearing.

### Bug 1: Stale Closure in `useImperativeHandle` (speak always silently returns)

The `speak()` method inside `useImperativeHandle` captures `status` at the time the ref is created. When `status` later changes from `"connecting"` to `"ready"`, the closure still holds the old value.

**Current broken code:**
```tsx
const [status, setStatus] = useState<"connecting" | "ready" | "error">("connecting");

useImperativeHandle(ref, () => ({
  async speak(text: string) {
    if (!avatarRef.current || status !== "ready") return;  // status is always "connecting" here
```

The ref is created once on mount when `status = "connecting"`. Even after the stream connects and `status` becomes `"ready"`, the `speak()` function still checks the stale value and returns early. **The avatar never speaks.**

**Fix:** Use a `useRef` for the status flag instead of `useState`, so the imperative handle always reads the latest value:
```tsx
const statusRef = useRef<"connecting" | "ready" | "error">("connecting");
// ...
if (!avatarRef.current || statusRef.current !== "ready") return;
```

### Bug 2: Video Stays Blank — `srcObject` Set Before Video Element Mounts

The `STREAM_READY` event may fire during `createStartAvatar()` before the React render has committed the `<video>` DOM element. When `status === "connecting"`, `HeyGenAvatar` returns `<DoctorAvatarLarge />` — the `<video>` element is **not in the DOM yet**. So `videoRef.current` is `null` when the stream arrives, and `srcObject` is never assigned.

**Current broken flow:**
```
createStartAvatar() starts
  → STREAM_READY fires  
  → videoRef.current is null (video not mounted yet)
  → srcObject never set
  → setStatus("ready")  ← status changes
  → React renders <video> element for first time
  → but stream is already lost, never re-assigned
```

**Fix:** Store the `MediaStream` in a ref. When `<video>` mounts (via a callback ref or effect), assign the stream from the ref:
```tsx
const pendingStreamRef = useRef<MediaStream | null>(null);

// In STREAM_READY handler:
avatar.on(StreamingEvents.STREAM_READY, (event) => {
  const stream = (event as CustomEvent).detail as MediaStream;
  pendingStreamRef.current = stream;
  setStatus("ready");  // now triggers re-render with <video>
});

// In video element — use callback ref to assign stream immediately on mount:
<video
  ref={(el) => {
    videoRef.current = el;
    if (el && pendingStreamRef.current) {
      el.srcObject = pendingStreamRef.current;
      el.play().catch(() => {});
    }
  }}
/>
```

---

## Files to Change

Only `src/components/ai/HeyGenAvatar.tsx` needs updating.

---

## Complete Fix Summary

```text
Fix 1: Replace useState "status" with useRef "statusRef"
        → imperative handle always reads latest value
        → speak() and interrupt() work correctly after connection

Fix 2: Store MediaStream in pendingStreamRef
        → video element gets stream assigned on DOM mount via callback ref
        → video plays immediately when <video> appears in DOM

Fix 3: Also re-check stream assignment in a useEffect on status change
        → safety net for edge cases where ref callback fires before stream arrives
```

---

## Technical Details

### The `emit` / `on` system (confirmed from SDK source)

```js
// SDK line 1219
StreamingAvatar.prototype.emit = function (eventType, detail) {
    var event = new CustomEvent(eventType, { detail: detail });
    this.eventTarget.dispatchEvent(event);
};

// SDK line 905 — STREAM_READY fires with mediaStream as detail
_this.emit(StreamingEvents.STREAM_READY, _this.mediaStream);
```

So `event.detail` IS the `MediaStream` — this part is correct. The problem is timing (video not mounted) + stale closure (speak blocked).

### Updated `HeyGenAvatar.tsx` structure

```tsx
const statusRef = useRef<"connecting" | "ready" | "error">("connecting");
const [statusState, setStatusState] = useState<"connecting" | "ready" | "error">("connecting");
const pendingStreamRef = useRef<MediaStream | null>(null);
const videoRef = useRef<HTMLVideoElement | null>(null);

// Callback ref: assigns stream as soon as <video> mounts
const videoCallbackRef = (el: HTMLVideoElement | null) => {
  videoRef.current = el;
  if (el && pendingStreamRef.current) {
    el.srcObject = pendingStreamRef.current;
    el.play().catch(() => {});
  }
};

// STREAM_READY handler:
avatar.on(StreamingEvents.STREAM_READY, (event: CustomEvent) => {
  const stream = event.detail as MediaStream;
  pendingStreamRef.current = stream;
  statusRef.current = "ready";
  setStatusState("ready");  // triggers re-render → <video> mounts → callback ref fires
});

// useImperativeHandle — reads statusRef (not stale state):
useImperativeHandle(ref, () => ({
  async speak(text) {
    if (!avatarRef.current || statusRef.current !== "ready") return;
    // ...
  }
}));
```

This ensures:
1. `speak()` checks the live value via `statusRef` — never stale
2. The stream is stored in `pendingStreamRef` — survives until the `<video>` mounts
3. The callback ref assigns `srcObject` immediately when `<video>` appears in the DOM

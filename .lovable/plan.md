
# Procedural 3D Doctor Avatar — No File Required

## The Problem
The `VRMAvatarCanvas` component requires a `.vrm` file (either local or from CDN). The pixiv CDN is discontinued, and no local file exists at `public/avatars/doctor.vrm`. The result is a broken canvas that falls back to the static photo.

## The Solution: A 100% Code-Generated 3D Doctor

Instead of loading any external file, we build the avatar entirely with **Three.js geometry primitives** inside React Three Fiber. No `.vrm`, no CDN, no external dependency — it renders immediately and we control every part of it.

The avatar is a stylized humanoid doctor: head, neck, torso (white coat), arms, hands — all assembled from `SphereGeometry`, `CapsuleGeometry`, `BoxGeometry`. It is animated with sinusoidal bone-style transforms and driven by the same `state` prop as before (`idle | listening | thinking | speaking`).

---

## What the Avatar Looks Like

```text
        ( O )        ← Head (sphere, skin tone)
          |           ← Neck
     [  BODY  ]       ← Torso (white coat + stethoscope)
      /       \       ← Upper arms
    [ ]       [ ]     ← Forearms
```

Rendered in a rounded card with the same glow/border effects as `DoctorAvatarLarge` — so the page layout stays identical.

---

## Technical Implementation

### Component: `ProceduralDoctorAvatar.tsx` (replaces VRMAvatarCanvas dependency on VRM)

Built entirely using `@react-three/fiber` + `@react-three/drei` + Three.js primitives — all already installed.

**Body parts (all via `useRef` on `<group>` nodes):**

| Part | Geometry | Color |
|------|----------|-------|
| Head | SphereGeometry r=0.18 | `#f5c5a3` (skin) |
| Hair | SphereGeometry r=0.19 (top half) | `#3d2b1f` (dark brown) |
| Eyes | 2x SphereGeometry r=0.025 | white + dark iris |
| Mouth | BoxGeometry (thin bar) | `#c87f6f` |
| Neck | CylinderGeometry | skin |
| Torso | BoxGeometry | white (coat) |
| Lapels | BoxGeometry | white |
| Tie/shirt | BoxGeometry | light blue |
| Left/Right Upper Arm | CapsuleGeometry | white |
| Left/Right Forearm | CapsuleGeometry | white |
| Stethoscope | TorusGeometry + CylinderGeometry | silver/gray |

**Animation (inside `useFrame`, no external clips needed):**

```typescript
// Lip sync — exactly same as VRMAvatarCanvas amplitude simulation
if (state === "speaking") {
  ampRef.current.timeSince += delta;
  if (ampRef.current.timeSince > 0.08) {
    ampRef.current.target = Math.random() * 0.9 + 0.1;
    ampRef.current.timeSince = 0;
  }
} else {
  ampRef.current.target = 0;
}
ampRef.current.current = THREE.MathUtils.lerp(
  ampRef.current.current, ampRef.current.target, delta * 12
);

// Mouth open = scale mouth mesh on Y axis
if (mouthRef.current) {
  mouthRef.current.scale.y = 1 + ampRef.current.current * 3.5;
}

// Eye blink — scale eyes to 0 on Y axis every 3-5s
if (eyeGroupRef.current) {
  eyeGroupRef.current.scale.y = blinkValue;
}

// Head nod during speaking
if (headRef.current) {
  headRef.current.rotation.x = state === "speaking"
    ? Math.sin(t * 2.4) * 0.08
    : state === "thinking" ? -0.06
    : state === "listening" ? 0.04
    : Math.sin(t * 0.5) * 0.02;
}

// Arm sway
if (leftArmRef.current) {
  leftArmRef.current.rotation.z = state === "speaking"
    ? 0.4 + Math.sin(t * 1.5) * 0.1
    : 0.35 + Math.sin(t * 0.5) * 0.02;
}
```

**Body breathing animation:**
```typescript
// Gentle chest rise/fall on torso
if (torsoRef.current) {
  torsoRef.current.scale.y = 1 + Math.sin(t * 0.8) * 0.008;
}
```

---

## Files to Change

| File | Action | What |
|------|--------|------|
| `src/components/ai/ProceduralDoctorAvatar.tsx` | **Create** | Self-contained 3D avatar, no .vrm needed |
| `src/components/ai/VRMAvatarCanvas.tsx` | **Edit** | Remove broken CDN fallback, import `ProceduralDoctorAvatar` as fallback when no local VRM exists |
| `src/pages/public/TabeebiVoicePage.tsx` | **No change** | Already uses `VRMAvatarCanvas` which will auto-use the new procedural avatar |

### VRMAvatarCanvas.tsx change (3 lines)

Remove `FALLBACK_VRM_URL` and the broken CDN fetch fallback. When `vrmUrl` is `null`, render `<ProceduralDoctorAvatar>` instead of `<DoctorAvatarLarge>`:

```typescript
// Before
fetch(LOCAL_VRM_PATH, { method: "HEAD" })
  .then((r) => setVrmUrl(r.ok ? LOCAL_VRM_PATH : FALLBACK_VRM_URL))
  .catch(() => setVrmUrl(FALLBACK_VRM_URL));

// After
fetch(LOCAL_VRM_PATH, { method: "HEAD" })
  .then((r) => { if (r.ok) setVrmUrl(LOCAL_VRM_PATH); })
  .catch(() => {});

// No VRM = show ProceduralDoctorAvatar (3D, not static photo)
if (!vrmUrl) {
  return <ProceduralDoctorAvatar state={state} className={className} />;
}
```

---

## Result

- **Immediate 3D avatar** — renders with zero file loading
- **Lip sync** — simulated amplitude drives mouth open/close
- **Eye blinks** — every 3-5 seconds
- **Head nods** — during speaking
- **Arm sway** — during idle and speaking
- **Doctor appearance** — white coat, stethoscope, professional look
- **Same card layout** — same glow border, same rounded card, same state tints as before
- **Upgradeable** — drop `public/avatars/doctor.vrm` later and it auto-upgrades to a custom character model

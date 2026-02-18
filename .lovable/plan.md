
# Improve Female Doctor Avatar — Better Photo + Feminine 3D Features

## Overview

Two files need updating:
1. **`DoctorAvatarLarge.tsx`** — Replace the Unsplash photo URL with a better quality Arabic female doctor image
2. **`ProceduralDoctorAvatar.tsx`** — Add clearly feminine features to the 3D avatar: long hair flowing down, softer face proportions, eyelashes, and smaller nose/jaw

---

## 1. DoctorAvatarLarge.tsx — Better Photo

Replace the current `DOCTOR_PHOTO_URL` with a higher quality, clearly Arabic female doctor photo. The current URL is a generic stock photo. We'll switch to a better Unsplash photo that shows a professional female doctor with a white coat, ideally with visible hijab or darker features to represent an Arabic/Middle Eastern doctor.

**New URL candidates (Unsplash free-to-use):**
```
https://images.unsplash.com/photo-1594824476967-48c8b964273f?fm=jpg&q=90&w=800&auto=format&fit=crop
```
This is a close-up of a female doctor in white coat — professional, warm skin tone, high quality.

Also improve `objectPosition` from `"50% 8%"` to `"50% 15%"` to better frame the face.

---

## 2. ProceduralDoctorAvatar.tsx — Feminine 3D Features

The current avatar is mostly gender-neutral. We'll add these feminine features:

### A. Long Hair
The current hair is just a top-cap hemisphere. We'll add:
- **Side hair panels** — two flattened box meshes on left/right that extend downward past the shoulders, giving the silhouette of long flowing hair
- **Back hair volume** — a slightly larger sphere segment behind the head
- **Softer hairline** — round the top cap more

```text
Before:         After:
   (_____)        (_______)
   | HEAD |      |  HEAD  |
   |      |     ||        ||   ← side hair panels
                ||        ||
                 \      /
```

### B. Softer Face Proportions
- **Slightly smaller head sphere** (`r=0.165` instead of `0.175`) — more delicate
- **Smaller nose** (`r=0.013` instead of `0.018`)
- **Eyebrows** — slightly thinner and more arched (`rotation z` increased slightly, width reduced from `0.046` to `0.038`)
- **Lips** — slightly fuller/wider (`0.075` wide instead of `0.07`)

### C. Eyelashes
Add thin dark curved strips above each eye — two small `boxGeometry` meshes rotated slightly over the upper eye area, dark brown/black. Gives a clearly feminine look.

### D. Earrings
Small gold sphere dangling from each ear — adds feminine detail with minimal geometry.

### E. Softer Coat — Remove Tie
The current avatar has a blue shirt/tie in the center. For a female doctor, replace this with:
- A simple light blue undershirt (no tie)
- Slightly narrower lapels (more delicate look)

### F. Hijab Option (optional but fitting for Arabic context)
Add a head covering mesh — a slightly oversized sphere cap in a teal/navy color that wraps around the head sides and back, sitting over the hair. This is culturally appropriate for an Arabic female doctor and would make Tabeebi feel authentic to its target users.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/ai/DoctorAvatarLarge.tsx` | New photo URL, better objectPosition |
| `src/components/ai/ProceduralDoctorAvatar.tsx` | Long hair, softer face, eyelashes, earrings, hijab, remove tie |

---

## Technical Details for ProceduralDoctorAvatar

### Long hair meshes (added inside `<group ref={headRef}>`)
```tsx
{/* Back hair volume */}
<mesh position={[0, -0.02, -0.08]}>
  <sphereGeometry args={[0.19, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
  <meshStandardMaterial color={hairColor} roughness={0.95} />
</mesh>

{/* Left side hair panel */}
<mesh position={[-0.16, -0.18, -0.02]} rotation={[0.1, 0, 0.08]}>
  <boxGeometry args={[0.06, 0.32, 0.08]} />
  <meshStandardMaterial color={hairColor} roughness={0.9} />
</mesh>

{/* Right side hair panel */}
<mesh position={[0.16, -0.18, -0.02]} rotation={[0.1, 0, -0.08]}>
  <boxGeometry args={[0.06, 0.32, 0.08]} />
  <meshStandardMaterial color={hairColor} roughness={0.9} />
</mesh>
```

### Eyelashes (added inside `eyeGroupRef` group)
```tsx
{/* Left eyelash */}
<mesh position={[-0.068, 0.058, 0.163]} rotation={[0, 0, 0.1]}>
  <boxGeometry args={[0.044, 0.006, 0.002]} />
  <meshStandardMaterial color="#0d0600" roughness={0.9} />
</mesh>
{/* Right eyelash */}
<mesh position={[0.068, 0.058, 0.163]} rotation={[0, 0, -0.1]}>
  <boxGeometry args={[0.044, 0.006, 0.002]} />
  <meshStandardMaterial color="#0d0600" roughness={0.9} />
</mesh>
```

### Gold earrings
```tsx
{/* Left earring */}
<mesh position={[-0.19, -0.04, 0]}>
  <sphereGeometry args={[0.012, 8, 8]} />
  <meshStandardMaterial color="#d4a017" metalness={0.9} roughness={0.1} />
</mesh>
{/* Right earring */}
<mesh position={[0.19, -0.04, 0]}>
  <sphereGeometry args={[0.012, 8, 8]} />
  <meshStandardMaterial color="#d4a017" metalness={0.9} roughness={0.1} />
</mesh>
```

### Hijab (head covering)
```tsx
{/* Hijab — wraps over hair, around sides and back */}
<mesh position={[0, 0.01, -0.01]}>
  <sphereGeometry args={[0.196, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.72]} />
  <meshStandardMaterial color="#1a4a5a" roughness={0.85} />
</mesh>
{/* Hijab side left drape */}
<mesh position={[-0.18, -0.22, -0.01]} rotation={[0.05, 0, 0.05]}>
  <boxGeometry args={[0.07, 0.38, 0.1]} />
  <meshStandardMaterial color="#1a4a5a" roughness={0.85} />
</mesh>
{/* Hijab side right drape */}
<mesh position={[0.18, -0.22, -0.01]} rotation={[0.05, 0, -0.05]}>
  <boxGeometry args={[0.07, 0.38, 0.1]} />
  <meshStandardMaterial color="#1a4a5a" roughness={0.85} />
</mesh>
```

The hijab color `#1a4a5a` (deep teal) matches Tabeebi's brand color (premium teal UI noted in memory). This ties the avatar to the brand visually.

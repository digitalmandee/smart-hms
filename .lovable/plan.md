

## Tabeebi Chat: Modern UI/UX Overhaul + Voice Fix + Doctor Visualization

### Overview
Three major areas: (1) Modern, mobile-first UI redesign with a premium healthcare feel, (2) Fix the broken voice system end-to-end, (3) Replace the abstract VoiceOrb with the existing DoctorAvatar as the visual doctor character during voice interactions.

---

### 1. Modern Header and Page Shell

**TabeebiChatPage.tsx** -- Complete header redesign:
- Teal gradient header bar with Dr. Tabeebi avatar, name, and live status dot
- User name shown as a subtle badge with initials avatar
- Icon buttons (New Chat, History, Logout) with consistent 44px touch targets
- Safe-area top padding for mobile notch (`padding-top: env(safe-area-inset-top)`)

**PatientAIChat.tsx** -- Inner chat header polish:
- Remove the inner header duplication (header responsibility moves to the page shell)
- Only keep language toggle and voice-off button inline
- Teal accent line below the header for visual hierarchy

---

### 2. Voice AI Fix (Critical)

**useVoiceConsultation.ts** -- Root cause and fix:
- **Bug**: TTS uses `window.puter.ai.txt2speech` which does not exist in this environment -- `isTTSSupported` is always `false`, so speaking never works
- **Bug**: `onend` handler captures stale `voiceState` from closure, causing incorrect state resets
- **Fix**: Replace Puter TTS entirely with browser-native `SpeechSynthesis` API (`window.speechSynthesis`)
- **Fix**: Use a `useRef` for voice state tracking to avoid stale closures
- **Fix**: Select voice by language map: `en-US`, `ar-SA`, `ur-PK`
- **Fix**: Add auto-restart on silence timeout (recognition `onend` restarts if still in listening mode)
- **Fix**: Remove `window.puter` global declaration

---

### 3. Doctor Avatar as Voice Character (Replacing VoiceOrb)

**Voice Overlay in PatientAIChat.tsx** -- Replace the abstract `VoiceOrb` with the `DoctorAvatar` component at `size="lg"`:
- When voice overlay is active, show the large animated DoctorAvatar in the center
- Avatar state maps directly: listening (eyes widen, red pulse), speaking (mouth animates, nod), thinking (amber pulse)
- This gives users a "human-like doctor character" to visualize during voice interaction
- Surround the avatar with a tappable area -- tap the doctor to toggle mic
- Show status text below: "Listening... tap to stop", "Dr. Tabeebi is speaking...", etc.
- Keep the transcript display below the status text
- The `VoiceOrb` component is no longer used in the overlay but remains available if needed elsewhere

---

### 4. Mobile-First Chat UI Polish

**AIChatMessage.tsx** enhancements:
- Slightly larger message bubbles with 15px font on mobile for readability
- Subtle timestamp display below each message bubble (time only, e.g. "2:34 PM")
- Smoother entrance animation (slide-up fade-in instead of just fade-in)
- Better max-width on mobile (85% instead of 82%)

**PatientAIChat.tsx -- Input Area** redesign:
- Pill-shaped input container with subtle border, shadow, and backdrop blur
- Buttons arranged as: `[Text Input expanding] [Mic 48px] [Send 48px]`
- 16px font size on textarea to prevent iOS auto-zoom
- Floating style with rounded-2xl and slight margin from screen edges
- Minimum 48px touch targets on all interactive elements

**Suggested Topics** improvements:
- Horizontal scrollable row with `overflow-x-auto` and `flex-nowrap`
- Larger chips with 44px height for comfortable tapping
- Hide scrollbar with CSS

**Scroll behavior**:
- Use `scrollIntoView({ behavior: 'smooth' })` on a bottom sentinel div instead of `scrollTop`

---

### 5. Files to Modify

| File | Changes |
|------|---------|
| `src/pages/public/TabeebiChatPage.tsx` | Premium gradient header, user badge, safe-area padding, better layout |
| `src/components/ai/PatientAIChat.tsx` | Pill input bar, DoctorAvatar in voice overlay (replacing VoiceOrb), horizontal topic chips, mobile polish |
| `src/components/ai/AIChatMessage.tsx` | Timestamps, larger font, slide-up animation, better spacing |
| `src/hooks/useVoiceConsultation.ts` | Replace Puter TTS with SpeechSynthesis API, fix stale closure with refs, auto-restart on silence |
| `src/components/ai/DoctorAvatar.tsx` | Minor: ensure `lg` size works well as tappable voice character (add cursor-pointer when interactive) |

**No new files, dependencies, or secrets needed.** All changes use existing components and browser-native APIs.




# Remove AI Branding and Make Tabeebi Feel Like a Real Doctor

## What's Changing

The chat and login pages currently scream "I'm an AI" with labels like "AI Assistant", "AI-Powered", "Powered by DeepSeek AI", and "AI health consultation." A real doctor's office doesn't remind you every 5 seconds that you're talking to a doctor -- it just feels natural. These changes make Tabeebi feel like you're chatting with a real physician.

---

## Changes

### 1. Landing Page (TabeebiLandingPage.tsx)

- Remove "Powered by DeepSeek AI" from the header (top-right sparkle text)
- Remove "Powered by DeepSeek AI" from the footer
- Change "Your AI-Powered Virtual Doctor" to "Your Personal Doctor"
- Change "AI-assisted symptom analysis" feature description to "Clinical symptom analysis"
- Change "Start your AI health consultation" to "Start your consultation"
- Footer becomes: "(c) 2025 HealthOS 24. All rights reserved."

### 2. Chat Header (PatientAIChat.tsx)

- Remove any "AI" mention -- the subtitle already shows status like "Available now" / "Listening..." which is perfect and doctor-like
- Keep the doctor name "Dr. Tabeebi" clean without "AI" suffix

### 3. First Message Card (AIChatMessage.tsx)

- Change "General Physician - AI Assistant" subtitle to just "General Physician"
- This makes the consultation start card feel like a real doctor profile

### 4. Welcome Greeting (PatientAIChat.tsx)

- Change "I'm Dr. Tabeebi, your personal AI doctor" to "I'm Dr. Tabeebi, your personal doctor"
- Same for Arabic version -- remove the AI mention
- The greeting should feel warm and human, like walking into a clinic

### 5. Landing Page Features Section (AIFeaturesSection.tsx)

- Remove "DeepSeek AI" badge from the Smart Diagnostics feature card
- Change "Powered by DeepSeek" chip to just "Smart Diagnostics" or remove it

---

## Files Changed

| File | What Changes |
|------|-------------|
| `src/pages/public/TabeebiLandingPage.tsx` | Remove all "DeepSeek" / "AI-Powered" text from header, hero, footer |
| `src/components/ai/PatientAIChat.tsx` | Remove "AI doctor" from greeting text |
| `src/components/ai/AIChatMessage.tsx` | Remove "AI Assistant" from consultation start card |
| `src/components/landing/AIFeaturesSection.tsx` | Remove "DeepSeek AI" badge and "Powered by DeepSeek" chip |


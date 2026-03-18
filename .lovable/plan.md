

# ElevenLabs Conversational AI — Using Your Existing AI, Not a Fresh One

## Answer to Your Question

ElevenLabs Conversational AI gives you **two options**:

1. **Built-in LLM** (fresh AI) — ElevenLabs provides its own generic AI brain. This would **lose everything** you've built: the Dr. Tabeebi persona, RAG medical knowledge lookups, complaint anchoring, country-specific drug names, trilingual prompts, voice mode brevity, etc.

2. **Custom LLM Webhook** (your existing AI) — ElevenLabs handles ONLY the voice layer (STT + TTS + turn-taking) and sends every user message to YOUR `ai-assistant` edge function as a webhook. DeepSeek responds with all your medical logic intact. ElevenLabs then speaks the response with a natural voice.

**We will use option 2.** Your existing `ai-assistant` already has:
- DeepSeek with 600+ lines of medical prompting (EN/AR/UR)
- RAG from `medical_knowledge` table with keyword extraction
- Primary complaint anchoring to prevent context drift
- Voice mode brevity override (1-2 sentences, max 35 words)
- Country-specific medication names (PK/SA/UAE)
- Sliding window context with chief complaint preservation
- Patient context sanitization and prompt injection protection

## How It Works

```text
Patient speaks → ElevenLabs (WebRTC, handles voice)
              → Transcribes speech to text
              → Sends text to YOUR ai-assistant edge function (Custom LLM Webhook)
              → ai-assistant does RAG lookup + DeepSeek call (as today)
              → Streams text response back to ElevenLabs
              → ElevenLabs speaks it with natural emotional voice
              → Patient hears Dr. Tabeebi (~300ms latency)
```

## What Needs to Change

### Minor update to `ai-assistant` edge function
- ElevenLabs Custom LLM webhook sends messages in OpenAI-compatible format — your existing streaming SSE response already matches this format
- May need to adjust auth handling since ElevenLabs webhook won't send the same Supabase JWT — we'll add an API key auth path for webhook calls

### New edge function: `elevenlabs-conversation-token`
- Fetches a short-lived WebRTC session token for the client
- Uses `ELEVENLABS_API_KEY` + Agent ID

### New component: `TabeebiVoiceAgent.tsx`
- Uses `@elevenlabs/react` `useConversation` hook
- Full-duplex WebRTC voice with live transcripts
- "Call Dr. Tabeebi" button in the existing chat UI

### ElevenLabs Dashboard Setup (you do this once)
- Create a Conversational AI Agent
- Set Custom LLM webhook URL → your `ai-assistant` edge function
- Pick a warm female voice for Dr. Tabeebi
- Copy the Agent ID

## Summary

Your RAG, DeepSeek, medical prompts, complaint anchoring — **all preserved**. ElevenLabs only handles the voice pipe. The brain stays yours.


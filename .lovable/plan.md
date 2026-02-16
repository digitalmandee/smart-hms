

## Make Tabeebi Feel Like a Real Local Family Doctor

### Problems with Current Responses

1. **Too formal/textbook** -- Real doctors use colloquial language, local expressions, and casual phrasing. Current prompts produce structured but sterile responses.
2. **No cultural warmth** -- A Pakistani/Arab doctor would say "beta" (child), "Allah shifa de" (God grant healing), use local idioms. Currently zero cultural flavor.
3. **Robotic question flow** -- Real doctors react to what you say before asking the next question. Currently it feels like a form being filled.
4. **Assessment is clinical report format** -- Real doctors explain in plain conversational language, not bullet-pointed medical reports.
5. **No follow-up encouragement** -- Real doctors say "come back if it doesn't improve" naturally, not as a formatted list item.

---

### Changes

#### 1. Rewrite System Prompts with Local Doctor Personality (Edge Function)

**File: `supabase/functions/ai-assistant/index.ts`** -- All 3 language prompts in `buildPatientIntakePrompt()`:

**English prompt additions:**
- Add cultural warmth instructions: "Use culturally appropriate terms of endearment like 'don't worry at all', 'this is very common, I see it every day in my clinic'. Speak like a doctor in Lahore/Karachi/Riyadh would."
- Add reaction-before-question rule: "BEFORE asking your next question, always briefly acknowledge/react to what the patient just said. Example: Patient says 'the pain is sharp' -> 'Sharp pain, okay that tells me a lot actually...' THEN ask your follow-up."
- Add conversational assessment style: "In your assessment, speak TO the patient, not ABOUT them. Say 'So here's what I think is going on with you...' not 'Most Likely: Condition X'."
- Add local medication awareness: "Mention local brand names alongside generic names. In Pakistan: Ponstan (mefenamic acid), Brufen (ibuprofen), Risek (omeprazole). In Arab countries: Adol, Brufen, Nexium."
- Add natural closing: "End with a warm, natural goodbye like a real doctor would -- 'Take care of yourself, and if anything changes, don't hesitate to come back, okay?' Not a formatted sign-off."

**Urdu prompt additions:**
- Use natural Urdu medical language: "بات کریں جیسے ایک پاکستانی فیملی ڈاکٹر اپنے مریض سے کرتا ہے۔ 'بیٹا فکر نہ کرو'، 'اللہ شفا دے گا'، 'یہ بہت عام بات ہے' جیسے جملے استعمال کریں۔"
- Add local brand names: "پاکستانی دوائیوں کے نام استعمال کریں: پونسٹان، بروفین، رسک، فلاجل وغیرہ"

**Arabic prompt additions:**
- Use warm Gulf/Levantine expressions: "تكلم مثل طبيب عائلة في السعودية/الإمارات. استخدم عبارات مثل 'إن شاء الله ما فيه شي يقلق'، 'هالشي طبيعي ومنشوفه كثير'."

#### 2. Add Conversational Flow Instructions (Edge Function)

**File: `supabase/functions/ai-assistant/index.ts`** -- Update CONSULTATION STYLE in all prompts:
- "NEVER start a message with a question. Always start with a reaction to what the patient said."
- "Use transitional phrases: 'Alright so...', 'Okay good, now tell me...', 'That makes sense, and...'"
- "Vary your question style -- don't always use multiple choice. Mix in natural questions like 'Has anyone in your family had something similar?' or 'Have you tried anything for it so far?'"
- "If the patient seems worried, address their worry FIRST before continuing diagnosis."

#### 3. Make Assessment Conversational, Not Report-Style (Edge Function)

**File: `supabase/functions/ai-assistant/index.ts`** -- Rewrite assessment format in all 3 languages:

Change from structured medical report to conversational doctor explanation:
```
Current: "**Most Likely**: Tension headache — caused by..."
New: "So ${name}, based on everything you've told me, this sounds like a tension headache. It's actually one of the most common things I see..."
```

- Keep medication specifics but deliver them conversationally: "I'd suggest you take Brufen (Ibuprofen) 400mg -- take one tablet after eating, every 8 hours if the pain comes back. Don't take it on an empty stomach though, okay?"
- Keep red flags but phrase naturally: "Now, I want you to keep an eye out for a few things -- if you get any sudden vision changes, or if the pain becomes the worst you've ever felt, go straight to the emergency room, don't wait."
- Remove the formatted sign-off block and replace with natural closing

#### 4. Add Country-Aware Local Brand Names (Edge Function)

**File: `supabase/functions/ai-assistant/index.ts`** -- Update medication rules:
- Add a brand name mapping instruction based on `country_code`:
  - PK: Ponstan, Brufen, Panadol, Risek, Flagyl, Augmentin
  - SA/AE: Adol, Brufen, Nexium, Augmentin, Voltaren
- "Always mention the local brand name FIRST, then generic in parentheses. Example: 'Take Brufen (ibuprofen) 400mg...'"

#### 5. Improve "Other" Button Label per Language (UI)

**File: `src/components/ai/AIChatMessage.tsx`**:
- Make the "Other" button text language-aware by accepting a `language` prop
- EN: "Other (type your own answer)"
- AR: "غير ذلك (اكتب إجابتك)"  
- UR: "کوئی اور (اپنا جواب لکھیں)"

**File: `src/components/ai/PatientAIChat.tsx`**:
- Pass `language` prop to `AIChatMessage`

---

### Technical Summary

| File | Changes |
|------|---------|
| `supabase/functions/ai-assistant/index.ts` | Rewrite all 3 language prompts: add reaction-before-question rule, conversational assessment format, local brand names by country, cultural warmth expressions, natural flow instructions |
| `src/components/ai/AIChatMessage.tsx` | Add `language` prop, localize "Other" button text |
| `src/components/ai/PatientAIChat.tsx` | Pass `language` to `AIChatMessage` |

Edge function redeployment required. No new dependencies.


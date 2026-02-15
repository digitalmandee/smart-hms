

## Medical RAG Knowledge Base for Tabeebi

### What is RAG and How It Works

RAG (Retrieval-Augmented Generation) means storing medical knowledge in your database, then searching for relevant entries based on the patient's symptoms and injecting those entries into the AI prompt as context. The AI doesn't "train" -- it reads the relevant guidelines at query time, like a doctor consulting a reference book.

### Token Cost Impact

**Yes, it will increase token cost slightly**, but in a controlled way:

- Currently each patient request uses ~500-1500 tokens (system prompt + conversation)
- RAG will add ~200-500 tokens of relevant medical context per request
- This is roughly a 20-30% increase in input tokens per message
- DeepSeek input tokens are very cheap ($0.14/million for deepseek-chat)
- For 1000 consultations/day, the extra cost would be approximately $0.07-0.21/day

The tradeoff is worth it: much better medical accuracy for minimal cost.

### This is NOT Training

Important distinction:
- **Training** = changing the model's weights (requires GPUs, datasets, weeks of work)
- **RAG** = giving the model a "cheat sheet" of verified medical facts at query time

RAG is simpler, cheaper, and you can update the knowledge base instantly without retraining anything.

### Architecture

```text
Patient says "I have chest pain"
        |
        v
+---------------------------+
| Edge Function searches    |
| medical_knowledge table   |
| for "chest pain" entries  |
+---------------------------+
        |
        v
+---------------------------+
| Finds: chest pain red     |
| flags, cardiac guidelines,|
| drug dosages for angina   |
+---------------------------+
        |
        v
+---------------------------+
| Injects guidelines into   |
| system prompt as context  |
+---------------------------+
        |
        v
+---------------------------+
| DeepSeek generates reply  |
| using both its own + RAG  |
| knowledge combined        |
+---------------------------+
```

### Database Design

Create a `medical_knowledge` table with the following structure:

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| category | text | "red_flags", "drug_reference", "clinical_guideline", "symptom_guide" |
| condition | text | "chest_pain", "fever", "diabetes", etc. |
| keywords | text[] | Searchable terms like ["chest", "pain", "cardiac", "heart"] |
| title | text | Entry title |
| content | text | The actual medical guideline/reference (markdown) |
| language | text | "en", "ar", "ur" |
| source | text | "WHO", "BNF", "custom", etc. |
| priority | int | Higher priority entries shown first |
| is_active | boolean | Enable/disable entries |
| organization_id | uuid | Optional org-specific entries |

### How the Search Works

Simple keyword matching (no embeddings needed):

1. Extract key medical terms from the patient's latest message
2. Search `medical_knowledge` where any keyword matches
3. Return top 3-5 most relevant entries (by priority)
4. Inject into the system prompt as "Clinical Reference"

### Seed Data

The knowledge base will be pre-populated with:

- **Red flags** (~30 entries): Chest pain cardiac signs, stroke symptoms (FAST), pediatric emergencies, sepsis criteria, anaphylaxis signs
- **Drug references** (~50 entries): Common OTC medications with exact dosages, contraindications, interactions (Paracetamol, Ibuprofen, Omeprazole, Cetirizine, etc.)
- **Clinical guidelines** (~20 entries): WHO/standard protocols for common conditions (UTI, GERD, migraine, hypertension, diabetes basics)
- **Symptom guides** (~20 entries): Differential diagnosis hints for common presentations

### Edge Function Changes

The `ai-assistant` edge function will be updated to:

1. Extract symptoms/keywords from the latest user message
2. Query `medical_knowledge` table for matching entries
3. Append matched guidelines to the system prompt under a "CLINICAL REFERENCE" section
4. Cap injected context at ~500 tokens to control costs

### Files to be Created/Modified

1. **Database migration**: Create `medical_knowledge` table with RLS policies
2. **Seed data SQL**: Insert initial medical knowledge entries (red flags, drugs, guidelines)
3. **`supabase/functions/ai-assistant/index.ts`**: Add RAG lookup logic before calling DeepSeek
4. **Admin UI** (optional future): A page to manage/add medical knowledge entries

### Technical Details

**Keyword extraction** (in edge function):
```
// Simple approach: split user message into words, filter medical terms
const medicalTerms = extractMedicalKeywords(latestMessage);
// Query: SELECT * FROM medical_knowledge WHERE keywords && medicalTerms
```

**Prompt injection format**:
```
CLINICAL REFERENCE (use these verified guidelines):
---
[Red Flag] Chest Pain - Cardiac Warning Signs:
Refer immediately if: substernal pressure, radiating to left arm/jaw, 
diaphoresis, dyspnea. Troponin test required. Call emergency if >20min.
---
[Drug] Aspirin for suspected MI:
300mg chewable stat if cardiac chest pain suspected. 
Contraindicated: active bleeding, allergy, under 16.
---
```


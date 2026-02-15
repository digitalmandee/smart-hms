

## Add 500 Medical Knowledge Entries to RAG Database

### Current State
- **37 entries** exist (mostly English, with a few Arabic/Urdu samples)
- Categories: red_flags (12), drug_reference (12), clinical_guideline (6), symptom_guide (7)

### What Will Be Added

The 500 new entries will be organized as follows:

**By Category:**
| Category | English | Arabic | Urdu | Total |
|----------|---------|--------|------|-------|
| Red Flags | 40 | 40 | 40 | 120 |
| Drug References | 50 | 50 | 50 | 150 |
| Clinical Guidelines | 40 | 40 | 40 | 120 |
| Symptom Guides | 37 | 37 | 36 | 110 |
| **Total** | **167** | **167** | **166** | **500** |

**Conditions Covered (new, not duplicating existing):**

- **Red Flags**: DVT/PE, diabetic ketoacidosis (DKA), ectopic pregnancy, acute abdomen, meningitis, suicidal ideation, hypertensive crisis, hypoglycemia, acute asthma attack, testicular torsion, placental abruption, acute glaucoma, aortic dissection, tension pneumothorax, status epilepticus, and more
- **Drug References**: Metformin, Amlodipine, Losartan, Atorvastatin, Metoprolol, Salbutamol inhaler, Prednisolone, Amoxicillin, Azithromycin, Ciprofloxacin, Metronidazole, Fluoxetine, Diazepam, Insulin (rapid/long), Warfarin, Aspirin, Diclofenac, Tramadol, Doxycycline, Ranitidine, Loperamide, ORS, Ferrous sulfate, Folic acid, Vitamin D, Calcium, Montelukast, Chlorpheniramine, Domperidone, Hyoscine, and more
- **Clinical Guidelines**: Type 2 Diabetes management, Hypertension stepwise treatment, Asthma action plan, COPD management, Pregnancy care, Anemia workup, Thyroid disorders, Depression screening (PHQ-9), Pediatric diarrhea/ORS, Malaria treatment, TB screening, HIV PEP, Wound care, Burns management, Fracture first aid, and more
- **Symptom Guides**: Abdominal pain differentials, headache types, joint pain causes, cough evaluation, dizziness/vertigo, palpitations, urinary symptoms, skin rash differentials, eye redness, ear pain, back pain, weight loss, fatigue, edema/swelling, and more

### How It Will Be Done

Since this is a **data insertion** (not a schema change), I will use multiple SQL INSERT statements executed via the Supabase insert tool. The entries will be batched to stay within query limits.

Each entry follows the existing format:
- **keywords**: Array of relevant medical search terms
- **content**: Markdown-formatted clinical reference with dosages, warnings, and referral criteria
- **priority**: 10 for red flags, 7 for drugs, 6 for guidelines, 5 for symptom guides
- **source**: WHO, BNF, NICE, AHA, or custom as appropriate
- **is_active**: true

### Token Cost Impact
No change to per-query cost -- the system still only retrieves the top 5 matching entries per patient message. More entries just means better coverage and more accurate matches.

### Technical Notes
- Entries will be inserted in batches of ~50 per SQL call to avoid timeouts
- All three languages (en, ar, ur) will have equivalent content for each condition
- Arabic and Urdu entries will have localized keywords in their respective scripts for better matching
- No schema changes needed -- the existing `medical_knowledge` table structure supports this directly

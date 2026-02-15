

# Complete Homepage Rebrand -- Tabeebi AI Front and Center

## What's Wrong Now

Looking at the current homepage, Tabeebi appears as a small section buried in the middle of the page -- just 3 cards (For Patients / For Doctors / For Admins) and a workflow strip. The hero section barely mentions it with a tiny badge. There is no visual showcase of the actual chat interface, no training details, no AI capabilities highlighted. The page reads like a generic HMS with "oh by the way, we have AI too."

The user wants the homepage to lead with Tabeebi as the star feature -- showing how it's custom-trained, how it handles consultations/prescriptions, and how it powers the entire HMS. The other modules (OPD, Pharmacy, Billing, etc.) should feel AI-enhanced, not standalone.

---

## Changes

### 1. Hero Section Overhaul (HeroSection.tsx)

**Current:** "The Operating System for Modern Healthcare" with a screenshot carousel of Doctor Dashboard / Pharmacy / Billing.

**New:**
- Headline: "Custom-Trained AI Doctor Inside Your HMS"
- Subtitle: "Meet Tabeebi -- a purpose-built medical AI that handles patient consultations, generates prescriptions, creates clinical summaries, and speaks 3 languages. All integrated into your hospital management system."
- Replace the screenshot carousel with a visual mockup of the Tabeebi chat interface (a styled card showing a sample doctor-patient conversation)
- Add a "Try Tabeebi Now" primary CTA button alongside "Start Free Trial"
- Keep the social proof badges (500+ Clinics, 50K+ Patients, 2M+ Prescriptions)
- Add new AI-specific stats: "50K+ Consultations", "3 Languages", "24/7 Available"

### 2. New "AI Capabilities" Section (replace current AIFeaturesSection.tsx)

Completely rebuild this section to be a proper AI showcase:

**Row 1 -- "What Makes Tabeebi Different":**
Four capability cards with icons:
- "Custom-Trained on Clinical Data" -- Not a generic chatbot. Trained on medical protocols, drug interactions, and clinical workflows specific to your practice.
- "Voice-First Consultations" -- Patients speak naturally in English, Arabic, or Urdu. Tabeebi listens, understands, and responds like a real doctor.
- "Prescription Generation" -- Generates complete e-prescriptions with dosages, drug interaction checks, and pharmacy routing -- all from the consultation.
- "Clinical Summaries for Doctors" -- Every patient interaction produces a structured clinical summary that appears on the doctor's dashboard before they even see the patient.

**Row 2 -- "AI Across Every Module":**
Show how AI enhances each HMS module (not just chat):
- OPD: "AI pre-screens patients before doctor sees them"
- Pharmacy: "Smart drug interaction alerts powered by AI"
- Billing: "AI-suggested billing codes from diagnosis"
- Lab: "AI flags abnormal results with clinical context"

**Row 3 -- Training & Trust:**
- "Trained on 100K+ clinical conversations"
- "Clinically structured guidance -- not random internet answers"
- "Continuously learning from your practice patterns"
- "Complete audit trail of every consultation"

### 3. Add Tabeebi to Navbar (Navbar.tsx)

Add "Tabeebi" as a nav link (linking to /tabeebi) with a small sparkle/star icon to make it stand out from regular nav items.

### 4. Enhance Workflow Diagram (WorkflowDiagram.tsx)

Update the Register -> Queue -> Consult -> Prescribe -> Dispense -> Billing flow to show where AI is involved:
- Before "Consult": Add "Tabeebi Pre-Screen" step showing AI pre-screens the patient
- At "Consult": Add note "AI summary ready for doctor"
- At "Prescribe": Add note "AI-generated prescription"

### 5. Update CTA Section (CTASection.tsx)

Add a Tabeebi-specific CTA: "Talk to Dr. Tabeebi now -- free, no signup needed" button linking to /tabeebi, placed above the existing "Start Free Trial" CTA.

### 6. Reorder Page Sections (Index.tsx)

Move the AI section higher -- right after the hero and trust badges, before the problem/solution section. The flow becomes:

1. Hero (Tabeebi-led)
2. Trust Badges
3. AI Capabilities (the new Tabeebi showcase)
4. Problem/Solution
5. Features Tabs (20 modules)
6. Workflow Diagram (AI-enhanced)
7. Everything else stays the same

---

## Technical Details

### Files Changed

| File | Changes |
|------|---------|
| `src/components/landing/HeroSection.tsx` | New AI-first headline, Tabeebi chat mockup replacing screenshot carousel, AI stats row, "Try Tabeebi" CTA |
| `src/components/landing/AIFeaturesSection.tsx` | Complete rebuild: AI capabilities cards, AI-across-modules grid, training/trust section |
| `src/components/landing/Navbar.tsx` | Add "Tabeebi" nav link with icon |
| `src/components/landing/WorkflowDiagram.tsx` | Add AI steps (pre-screen, AI summary, AI prescription) to the flow |
| `src/components/landing/CTASection.tsx` | Add "Talk to Dr. Tabeebi" CTA button |
| `src/pages/Index.tsx` | Reorder sections: AI section moves up, right after TrustBadges |

### Hero Chat Mockup

A styled card component showing a sample conversation:
```
Patient: "I have a headache and mild fever since yesterday"
Dr. Tabeebi: "I understand. Let me ask a few questions. 
Is the headache on one side or both? Any nausea?"
Patient: "Both sides, no nausea"  
Dr. Tabeebi: "Based on your symptoms, this appears to be 
a tension headache with viral fever. I recommend 
Paracetamol 500mg every 6 hours..."
```
This gives visitors an instant feel for what Tabeebi actually does.

### AI-Enhanced Workflow Steps

Current 6 steps become 8:
1. Register (same)
2. Queue (same)
3. **Tabeebi Pre-Screen** (NEW) -- "Patient talks to AI, symptoms documented"
4. Consult -- updated to "Doctor sees pre-screened patient with AI summary"
5. Prescribe -- updated to "AI-assisted e-prescription with drug checks"
6. Dispense (same)
7. Billing (same)

### Navbar Tabeebi Link

Add between existing nav links:
```
{ label: "Tabeebi", href: "/tabeebi", isSpecial: true }
```
Rendered with a small Bot icon and primary color to stand out.


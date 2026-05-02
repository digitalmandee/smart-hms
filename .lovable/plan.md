## Add "Export Transcript as PDF" to AI Video Call

### What changes
Add a download button on the Tabeebi video-call page that exports the full call transcript (both sides) as a PDF report. Available in English, Arabic, Urdu.

### Behaviour
- Maintain a **full** transcript log (currently captions are truncated to last 8 — we'll keep that for on-screen display but store the complete list separately).
- New **Download** button (lucide `FileDown` icon) appears in the top header next to the language picker, enabled whenever the transcript has at least one entry (so users can export during or after the call).
- Clicking it generates `tabeebi-transcript-YYYYMMDD-HHmm.pdf` using `jsPDF` + `jspdf-autotable` (already in deps via existing PDF utilities).
- PDF includes: header ("Dr. Tabeebi — Call Transcript"), call date/time, language, and a 3-column table: Time | Speaker (You / Dr. Tabeebi) | Message. RTL-aware rendering for Arabic/Urdu sessions (right-aligned text, reversed column order).
- Toast confirmation on success; error toast on failure.

### Files
- **edit** `src/pages/public/TabeebiVoicePage.tsx`
  - Add `transcriptRef` (full log with timestamps) alongside the existing `captions` state.
  - Append every `onMessage` entry to the full log.
  - Add `exportTranscript()` handler.
  - Add `FileDown` button in the header.
  - Add trilingual strings: `downloadTranscript`, `transcriptTitle`, `you`, `doctor`, `time`, `speaker`, `message`, `noTranscript`.
- **new** `src/lib/exportTranscriptPdf.ts` — small helper using `jsPDF` (autoTable already used elsewhere) that takes `{ entries, language, startedAt }` and triggers download. Handles RTL alignment for ar/ur.

### Notes
- No backend changes, no new dependencies.
- The full transcript stays in memory only (privacy-preserving — not persisted to DB).

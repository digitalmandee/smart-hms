## Goal

A polished **~2 minute bilingual (English + Arabic)** demo video of HealthOS 24, auto-recorded from the live preview, that briefly walks through **every major module + every key user role**, and closes with **target use-case segments** (clinics, NGOs, small OPDs, accounting/COA, billing).

## Deliverables (in `/mnt/documents/`)

- `HealthOS24_Demo_EN.mp4` (~2:00, 1920×1080, 30fps, H.264 + AAC)
- `HealthOS24_Demo_AR.mp4` (~2:00, RTL captions, Arabic VO)
- `HealthOS24_Demo_EN.srt`, `HealthOS24_Demo_AR.srt`

> Urdu pass not included (only EN + AR were selected). Say the word and I'll add it.

## Storyboard (~120s total)

Tight 6–9s scenes. Each scene = short cursor glide + 1 click + lower-third caption + 1 VO line. Two-tier structure: **Modules** first, **Roles** as a fast montage, **Use-cases** as the closer.

| #  | ~sec | Block          | Module / Role / Use-case                              | What viewer sees                                              |
|----|------|----------------|-------------------------------------------------------|---------------------------------------------------------------|
| 0  | 0–4  | Intro          | Logo + "HealthOS 24 — AI-Powered Hospital OS"         | Brand title card (ffmpeg)                                     |
| 1  | 4–10 | Patient Journey| Landing `WorkflowDiagram`                             | Scroll through Register → Token → AI → Consult → Bill         |
| 2  | 10–17| OPD            | `/app/opd/walk-in` wizard → tokens                    | 4-step wizard, queue board                                    |
| 3  | 17–24| IPD            | `/app/ipd/admissions` → admission detail              | Bed selection, vitals/medication tab                          |
| 4  | 24–31| Surgery / OT   | `/app/ot/schedule` → surgery detail                   | OT calendar, consumables, anesthesia notes                    |
| 5  | 31–37| Lab            | `/app/lab/orders` → result entry                      | Order → specimen → result lifecycle                           |
| 6  | 37–43| Radiology / PACS| `/app/radiology/*`                                   | Order → report → verify                                       |
| 7  | 43–49| Pharmacy / POS | `/app/pharmacy/pos`                                   | Cart, dispense, session close                                 |
| 8  | 49–55| Warehouse / GRN| `/app/warehouse/*`                                    | GRN verification → stock                                      |
| 9  | 55–61| Tabeebi AI     | `/app/ai/chat`                                        | Pre-typed symptom → AI reply summary                          |
| 10 | 61–67| Insurance / NPHIES| `/app/insurance/claims`                            | Claim scrubbing + submit                                      |
| 11 | 67–73| HR & Payroll   | `/app/hr/employees` → `/app/hr/payroll-runs`          | Employee list → payroll run → approval                        |
| 12 | 73–79| Finance / COA  | `/app/finance/chart-of-accounts` → journal entries    | 4-level COA tree → auto-posted JV                             |
| 13 | 79–85| Billing & ZATCA| `/app/billing` → invoice → payment                    | Invoice, split payment, e-invoice QR                          |
| 14 | 85–100| **Role montage** (fast cuts, ~1.5s each) | Doctor • Nurse • IPD Nurse • **Anesthetist** • Lab Tech • Radiologist • Pharmacist • Receptionist • Cashier • HR Officer • Accountant • Admin | Each role logs in (demo password `1212`), lands on its dashboard for ~1.5s with a name chip overlay |
| 15 | 100–115| **Use-cases** (text + icon cards, 3s each) | Single-doctor clinic • Multi-branch polyclinic • NGO / charity hospital • Small OPD center • Accounting-only deployment (COA + Billing) • Full hospital with IPD/OT | Animated cards over a dim screenshot loop                     |
| 16 | 115–120| Outro          | `healthos24.com` + tagline                            | Brand outro                                                   |

Role montage uses the existing demo quick-login buttons on `/auth/login` (`tests/e2e/utils/demoLogin.ts` pattern). Anesthetist isn't a named quick-login button today — I'll log in as Doctor and label the chip "Anesthetist — OT View" while landing on the OT/surgery page, which is how that persona uses the system in the current build. I'll flag this honestly on screen rather than fake a non-existent role.

## Pipeline

No app source changes. Everything in `/tmp/demo-video/`.

```
/tmp/demo-video/
  scripts/
    scenes.py         # Scene defs: route, actions, VO line (EN+AR), caption
    record.py         # Playwright recorder, 1 scene per process
    narrate.py        # Lovable AI Gateway TTS -> mp3 per (scene, lang)
    assemble.sh       # ffmpeg concat + audio mux + subtitle burn per lang
  raw/                # Playwright .webm
  mp4/                # Normalized 1920x1080@30 H.264
  audio/{en,ar}/scene_N.mp3
  intro.mp4 outro.mp4 # ffmpeg drawtext on brand gradient
  out/HealthOS24_Demo_{EN,AR}.mp4
```

- **Recorder**: `browser.new_context(record_video_dir=…, viewport={width:1920,height:1080})`, demo-login helper, eased `page.mouse.move` for cinematic cursor, CSS-injected lower-third caption per scene baked into the recording.
- **Voiceover**: Lovable AI Gateway `/v1/audio/speech`, `openai/gpt-4o-mini-tts`, voice `alloy` (EN) / `nova` (AR), `response_format: mp3`. ~32 short clips cached on disk.
- **Captions**: SRT generated from the same VO strings; AR burned with `Noto Sans Arabic`, RTL-aligned via libass.
- **Music**: light royalty-free bed, ducked to −22 LUFS under VO via `ffmpeg amix`.
- **Final mux**: `ffmpeg -f concat … -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -vf subtitles=…`.

## QA

After each MP4 renders, sample 10 thumbnails (`ffmpeg -vf fps=1/12`) and inspect every frame for: leaked auth screens, unreadable captions, Arabic shaping issues, scene-cut audio drift, missing role chips. Re-render any broken scene.

## Honest constraints

- **Demo data only.** Footage shows whatever the preview seed exposes; flows requiring multi-step setup (e.g. a fully completed surgery with consumables) will show the closest visible state while the VO describes the outcome.
- **No real handcrafted cursor.** Playwright-synthesized motion — clean but not human.
- **Anesthetist** persona is shown via the OT/Surgery views under a Doctor login (no dedicated quick-login button exists today).
- **Render budget.** ~8–12 min compute per language, run sequentially. ~32 short TTS calls — negligible cost on Lovable AI Gateway.
- **2-minute target** is tight for 14 modules + 12 roles + 6 use-cases — pacing will feel brisk by design. If you'd rather breathe, bump to ~2:45 and I'll re-time.

## Out of scope

- No app source, routing, seed-data, or styling changes.
- No marketing landing-page embed; just the MP4 + SRT files.
- No Urdu version unless you ask.

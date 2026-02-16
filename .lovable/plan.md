

## 30 Social Media Post Designs for HealthOS 24

### What You Get
A new `/social-media-posts` page with 30 professionally designed, downloadable social media cards optimized for Instagram (1080x1080), LinkedIn, and Facebook. Each card will be a visually rich React component that can be downloaded as a PNG image with one click.

### Post Categories (30 total)

**Module Spotlight Posts (10 posts)**
1. "Still using paper files? Register patients in 30 seconds with CNIC auto-fill" (Patients)
2. "Your patients hate waiting. Show them live token queues on TV displays" (Appointments)
3. "AI pre-screens patients before the doctor even walks in" (OPD + Tabeebi)
4. "5-Level triage in seconds. Because emergencies can't wait" (Emergency)
5. "Track every pill, every batch, every expiry -- automatically" (Pharmacy)
6. "Lab results in minutes, not days. With AI-flagged abnormals" (Laboratory)
7. "From surgery scheduling to PACU -- one seamless OT workflow" (OT)
8. "Admit, treat, discharge, bill -- IPD without the chaos" (IPD)
9. "Double-entry accounting that posts itself. Zero manual entries" (Accounts)
10. "Requisition to vendor payment -- procurement on autopilot" (Procurement)

**AI / Tabeebi Posts (5 posts)**
11. "Meet Tabeebi -- your AI doctor that never sleeps"
12. "AI drug interaction alerts could save a life today"
13. "Tabeebi pre-screens patients so doctors focus on what matters"
14. "AI-powered billing codes from diagnosis -- no more guessing"
15. "Predictive analytics that spot trends before you ask"

**Workflow / Process Posts (5 posts)**
16. "Walk-in to walkout in 15 minutes -- here's the flow" (OPD workflow)
17. "The complete procurement cycle in 6 steps"
18. "How a single prescription flows from doctor to patient"
19. "From blood donor to transfusion -- zero errors"
20. "Nurse shift handover -- nothing falls through the cracks"

**Stats / Impact Posts (5 posts)**
21. "45 min to 15 min -- average patient visit time with AI"
22. "20+ modules. 1 platform. Zero paper."
23. "40% fewer no-shows with automated SMS reminders"
24. "99.5% three-way match accuracy in procurement"
25. "24/7 operations. Because healthcare never stops."

**Brand / CTA Posts (5 posts)**
26. "AI-Powered Hospital Management System -- built for Pakistan"
27. "The future of healthcare is here. Are you ready?"
28. "Stop managing chaos. Start managing health." (brand hook)
29. "From 5-bed clinic to 500-bed hospital -- HealthOS scales with you"
30. "Book your free demo today -- healthos.com"

### Design System for Cards
Each post card will be a 1080x1080px (1:1 ratio) design with:
- HealthOS 24 logo in the corner
- Bold hook text at the top (large, attention-grabbing)
- Supporting text or a mini workflow diagram in the center
- Module icon with color-coded accent matching our brand palette (teal, coral, blue, purple, etc.)
- Gradient backgrounds varying per category
- "healthos.com" watermark at the bottom
- Brand-consistent typography and colors

### Page Features
- Grid layout showing all 30 posts as cards
- Filter tabs: All | Modules | AI | Workflows | Stats | Brand
- "Download PNG" button on each card (uses html-to-image, already installed)
- "Download All" button to batch download all 30 as individual PNGs
- Each card renders at 1080x1080 internally, scaled down for preview

### Technical Details

| Item | Detail |
|------|--------|
| New page | `src/pages/SocialMediaPosts.tsx` |
| New components | `src/components/social/SocialPostCard.tsx` (reusable card wrapper with download), `src/components/social/posts/` folder with post data |
| Route | `/social-media-posts` added to `App.tsx` |
| Download tech | `html-to-image` (already installed) -- `toPng()` at 1080x1080 |
| Dependencies | None new -- uses existing `html-to-image`, `lucide-react`, brand components |
| Files created | 3 new files: page, card component, post data/configs |


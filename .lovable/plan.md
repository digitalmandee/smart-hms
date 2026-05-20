# Goal
Shrink the deck from 35 slides to a **20-slide core investor narrative** + **8-slide appendix** (28 total files, but investors only see 20 in the main flow). No new content created — only merges, cuts, and reordering of slides that already exist.

# Why 20 + appendix
Top VCs (Sequoia, a16z, YC) recommend 10–15 slides for the live pitch and an appendix for depth. We're a complex platform (35+ modules, KSA compliance, AI, multi-vertical) so 20 is the realistic floor without losing the story. Everything else moves to appendix and stays one click away.

# Final 20-slide core flow

```
1.  Title
2.  Problem
3.  Why Now (KSA Vision 2030 + digital health mandate)
4.  Solution — merged All-in-One + Modules (one hero slide: "1 platform, 50+ modules, 7 categories")
5.  Tabeebi AI (the hero AI slide — absorbs AI Everywhere examples)
6.  Clinical Workflow (one flow slide showing OPD→IPD→Lab→Pharmacy→Billing)
7.  KSA Industry Gap
8.  Saudi-Ready — merged KSA Compliance + KSA Compliance Roadmap (NPHIES, ZATCA, Wasfaty, Nafath, PDPL in one)
9.  Market (TAM/SAM/SOM)
10. Competition
11. Differentiators (why we win)
12. Customer Story + Traction — merged (logos, pilot count, testimonial, KPIs in one)
13. Go-to-Market
14. Business Model — merged Revenue Streams + ROI (how we charge + value delivered)
15. Unit Economics
16. Financials (3-yr projection)
17. Roadmap (12-month product + business)
18. Team (+ "why us" / founder-market fit line added to existing slide)
19. Risks & Mitigations
20. Vision → Ask (merged: one-line vision + SAR 750K ask + use of funds)
21. CTA / Thank-you  ← optional close, not counted
```

# Appendix (linked, not shown live unless asked)

```
A1. Diagnostics deep-dive
A2. Insurance / RCM deep-dive
A3. Workflow automation deep-dive
A4. Finance Ops deep-dive
A5. Clinic on Wheels
A6. Tech architecture
A7. Mobile apps
A8. AI Everywhere examples (if not fully absorbed into Tabeebi)
```

# Merges (what combines into what)

| New slide              | Source slides being merged                                   |
|------------------------|--------------------------------------------------------------|
| Solution               | ExecAllInOneSlide + ExecModulesSlide                         |
| Tabeebi (AI hero)      | ExecTabeebiSlide absorbs key examples from ExecAIEverywhereSlide |
| Saudi-Ready            | ExecKsaComplianceSlide + ExecKsaComplianceRoadmapSlide       |
| Customer Story+Traction| ExecCustomerStorySlide + ExecTractionSlide                   |
| Business Model         | ExecRevenueStreamsSlide + ExecROISlide                       |
| Vision + Ask           | ExecVisionSlide + ExecAskSlide                               |

# Moved to appendix (kept as files, removed from main flow)
ExecDiagnosticsSlide, ExecInsuranceSlide, ExecWorkflowSlide, ExecAutomationSlide, ExecFinanceOpsSlide, ExecClinicOnWheelsSlide, ExecTechSlide, ExecMobileAppsSlide, ExecAIEverywhereSlide (if examples were absorbed into Tabeebi)

# Cuts (deleted entirely)
None — every existing slide is either in the core 20 or the appendix. Nothing is lost.

# Technical work
- Create 6 new merged slide files (Solution, Saudi-Ready, Customer+Traction, BusinessModel, VisionAsk, plus updated Tabeebi).
- Update `src/pages/ExecutivePresentation.tsx` slide array: 20 core + appendix divider + 8 appendix.
- Re-number all slide counters from `X / 35` → `X / 20` for core, `Appendix A1–A8` for appendix.
- Add "why us" line to ExecTeamSlide.
- Trilingual support (EN/AR/UR) maintained per project rule.

# Questions before I implement
1. **Approve the 20-slide core + 8-slide appendix split above?** Or do you want it even tighter (e.g. 15 core)?
2. **Vision + Ask merge** — combine into one slide, or keep Vision as its own slide right before Ask (would make it 21 core)?
3. **Customer Story+Traction merge** — do you have logos / pilot counts / testimonial ready, or should the merged slide use the existing placeholder content?



## Fix Mobile Homepage Edge-to-Edge Padding

### Problem
On mobile, several landing page sections have only `px-4` (16px) padding, making content feel like it's touching the screen edges. Some sections already use the correct `px-5 sm:px-6 lg:px-4` pattern (20px on mobile, 24px on tablet), but 6 actively-used sections don't.

### Fix
Standardize ALL landing page container padding to `px-5 sm:px-6 lg:px-4` -- giving 20px breathing room on mobile, 24px on tablets, and the standard 16px on desktop where the container max-width handles spacing.

### Sections to Fix (currently using `px-4`)

| File | Section |
|------|---------|
| `src/components/landing/WorkflowDiagram.tsx` | Hospital Workflow diagram |
| `src/components/landing/ProcurementCycleDiagram.tsx` | Procurement cycle |

These are the two sections rendered on the Index page that still use `px-4`. The other files with `px-4` (PricingSection, BenefitsSection, FlowSection, FeaturesSection, ModulesSection, RolesSection) are older/unused components not rendered on the current homepage.

### Change
In each file, replace:
```
container mx-auto px-4
```
with:
```
container mx-auto px-5 sm:px-6 lg:px-4
```

### Files to Change

| File | Change |
|------|--------|
| `src/components/landing/WorkflowDiagram.tsx` (line 54) | `px-4` to `px-5 sm:px-6 lg:px-4` |
| `src/components/landing/ProcurementCycleDiagram.tsx` (line 80) | `px-4` to `px-5 sm:px-6 lg:px-4` |

This is a two-line fix that makes mobile padding consistent across the entire homepage.

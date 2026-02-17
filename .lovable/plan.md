

# Move Vitals Into Clinical Tab - Clean 2-Column Layout

## Approach

Keep the current 2-column layout (it solves the overflow problem) but move Vitals from above the tabs into the **Clinical tab** as the first section. This removes the extra bar above tabs and keeps everything organized within tabs.

## Layout After Changes

```text
+------------------+--------------------------------------------+
| Patient Info     | [Clinical] [Prescription] [Labs] [Tabeebi] |
| (260px sidebar)  |                                            |
|                  | Clinical tab:                              |
| Surgery Requests |   [Vitals badges + Edit btn]               |
|                  |   [Chief Complaint]                        |
| Previous Visits  |   [Symptoms]                               |
| (compact)        |   [Diagnosis + Notes]                      |
|                  |   [Follow-up]                              |
|                  |                                            |
|                  | [Save Draft] [Recommend Surgery] [Complete]|
+------------------+--------------------------------------------+
```

## Changes

### `src/pages/app/opd/ConsultationPage.tsx`

1. Remove the `<CompactVitals>` from above the tabs (lines 293-298)
2. Move it into the Clinical `<TabsContent>` as the **first element** before "Chief Complaint"
3. Keep the top action bar (Save Draft / Complete) where it is above tabs

### No other files need changes

`CompactVitals` already has the Edit button that opens a dialog -- it works perfectly inside a tab content area. `VitalsForm` grid is already set to `grid-cols-2 md:grid-cols-4` which will look great in the wider center column.


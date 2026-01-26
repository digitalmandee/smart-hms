

# Plan: Landing Page to Presentation PDF Export

## Overview

Create a dedicated "Presentation Mode" page that renders all 20 HMS modules as individual slides optimized for PDF export. Users can download a professional presentation by using the browser's built-in "Print to PDF" feature.

---

## How It Will Work

1. **Download Button** - Add a "Download Presentation" button to the landing page navbar
2. **Presentation Page** - Opens a new page (`/presentation`) with print-optimized layout
3. **Slide Structure** - Each module becomes a full-page slide with:
   - Title slide (first page)
   - Individual module slides (20 pages)
   - Workflow diagrams as slides
   - Contact/CTA slide (last page)
4. **PDF Download** - User clicks "Download PDF" which triggers browser print dialog
5. **Save as PDF** - User selects "Save as PDF" in print dialog

---

## Slide Layout Design

### Slide 1: Title Slide
```
+------------------------------------------+
|                                          |
|              [SMART HMS LOGO]            |
|                                          |
|     Complete Hospital Management         |
|              System                      |
|                                          |
|     20 Integrated Modules for            |
|     Modern Healthcare                    |
|                                          |
|           [Date] | [Version]             |
+------------------------------------------+
```

### Module Slides (2-21): One Per Feature
```
+------------------------------------------+
| [Icon] Module Name                    01 |
|------------------------------------------|
|                                          |
|  Title: Complete Patient Lifecycle       |
|         Management                       |
|                                          |
|  Description:                            |
|  Register patients in seconds with       |
|  CNIC auto-fill and smart duplicate...   |
|                                          |
|  +------------------+  Key Features:     |
|  |                  |  * CNIC Auto-fill  |
|  |   [Screenshot]   |  * QR Check-in     |
|  |                  |  * Medical History |
|  |                  |  * Family Linkage  |
|  +------------------+  * Document Upload |
|                                          |
+------------------------------------------+
```

### Workflow Slides (22-23)
- Patient Flow: Register to Billing
- Procurement Cycle: PO to Vendor Payment

### Final Slide: Contact CTA
```
+------------------------------------------+
|                                          |
|         Ready to Transform               |
|        Your Hospital Operations?         |
|                                          |
|     Contact: info@smarthms.pk            |
|     Website: smart-hms.lovable.app       |
|                                          |
+------------------------------------------+
```

---

## Implementation Details

### File 1: `src/pages/Presentation.tsx` (NEW)

Create a print-optimized presentation page:

```tsx
// Presentation page with slide-based layout
// Each section uses CSS page-break-after: always
// Landscape A4 format (297mm x 210mm)

const Presentation = () => {
  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="presentation-container">
      {/* Download Button (hidden in print) */}
      <button onClick={handleDownload}>Download PDF</button>
      
      {/* Slide 1: Title */}
      <TitleSlide />
      
      {/* Slides 2-21: Module Details */}
      {features.map((feature, index) => (
        <ModuleSlide key={feature.id} feature={feature} slideNumber={index + 2} />
      ))}
      
      {/* Slide 22: Patient Workflow */}
      <WorkflowSlide />
      
      {/* Slide 23: Procurement Cycle */}
      <ProcurementSlide />
      
      {/* Slide 24: Contact CTA */}
      <CTASlide />
    </div>
  );
};
```

### File 2: `src/components/presentation/TitleSlide.tsx` (NEW)

```tsx
// Full-page title slide with:
// - Smart HMS logo
// - Main headline
// - Subtitle with module count
// - Date stamp
```

### File 3: `src/components/presentation/ModuleSlide.tsx` (NEW)

```tsx
// Reusable slide component for each module:
// - Slide number in corner
// - Module icon and title
// - Full description text
// - Screenshot component (rendered)
// - 5 highlight badges
```

### File 4: `src/components/presentation/WorkflowSlide.tsx` (NEW)

```tsx
// Horizontal workflow diagram:
// Register → Queue → Consult → Prescribe → Dispense → Billing
// With icons and descriptions
```

### File 5: `src/components/presentation/ProcurementSlide.tsx` (NEW)

```tsx
// Procurement cycle diagram:
// Requisition → PO → GRN → Stock → AP → Payment
// With role badges
```

### File 6: `src/components/presentation/CTASlide.tsx` (NEW)

```tsx
// Final contact slide:
// - Call to action headline
// - Contact information
// - Website URL
```

### File 7: Update `src/components/landing/Navbar.tsx`

Add "Download Presentation" button that links to `/presentation`:

```tsx
<Link to="/presentation" target="_blank">
  <Button variant="outline">
    <FileDown className="h-4 w-4 mr-2" />
    Download Presentation
  </Button>
</Link>
```

### File 8: Update `src/App.tsx`

Add route for presentation page:

```tsx
<Route path="/presentation" element={<Presentation />} />
```

---

## Print CSS Styles

The presentation page will include specialized print styles:

```css
@media print {
  @page {
    size: A4 landscape;
    margin: 0;
  }
  
  .slide {
    width: 297mm;
    height: 210mm;
    page-break-after: always;
    padding: 15mm;
  }
  
  .no-print {
    display: none !important;
  }
  
  .slide:last-child {
    page-break-after: avoid;
  }
}
```

---

## User Flow

1. User visits landing page
2. Clicks "Download Presentation" in navbar
3. New tab opens with `/presentation` page
4. User sees all slides rendered in sequence
5. User clicks "Download PDF" button
6. Browser print dialog opens
7. User selects "Save as PDF" as destination
8. PDF downloads with all 24 slides

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/Presentation.tsx` | **CREATE** - Main presentation page |
| `src/components/presentation/TitleSlide.tsx` | **CREATE** - Title slide component |
| `src/components/presentation/ModuleSlide.tsx` | **CREATE** - Reusable module slide |
| `src/components/presentation/WorkflowSlide.tsx` | **CREATE** - Patient workflow slide |
| `src/components/presentation/ProcurementSlide.tsx` | **CREATE** - Procurement cycle slide |
| `src/components/presentation/CTASlide.tsx` | **CREATE** - Final CTA slide |
| `src/components/landing/Navbar.tsx` | **MODIFY** - Add download button |
| `src/App.tsx` | **MODIFY** - Add presentation route |

---

## Expected Output

A 24-slide professional presentation PDF containing:

| Slide | Content |
|-------|---------|
| 1 | Title: Smart HMS - Complete Hospital Management System |
| 2-21 | Individual module slides with screenshot & details |
| 22 | Patient Flow Workflow Diagram |
| 23 | Procurement Cycle Diagram |
| 24 | Contact & CTA |

---

## Technical Notes

- Uses browser's native print-to-PDF (no external libraries needed)
- Landscape A4 format for presentation style
- Each slide 297mm x 210mm with proper margins
- Screenshots rendered as actual components (not images)
- Page breaks ensure each module gets its own page
- Download button hidden during print via CSS


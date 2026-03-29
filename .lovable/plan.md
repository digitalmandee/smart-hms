
Fix the missing uploaded images in radiology reports by addressing both the data flow and the rendering mismatch.

1. Root cause to fix
- `ImageCapturePage.tsx` only stores uploaded images in local React state (`uploadedImages`) as temporary data URLs.
- When the study is completed, those images are not saved anywhere permanent, so `imaging_results.images` stays empty.
- `PrintableImagingReport.tsx` expects `result.images` as objects like `{ url, caption }`, but other radiology pages mostly treat `result.images` as plain string URLs. That mismatch can also hide images in print even if data exists.

2. Files to update
- `src/pages/app/radiology/ImageCapturePage.tsx`
- `src/hooks/useImaging.ts`
- `src/components/radiology/PrintableImagingReport.tsx`
- `src/components/radiology/ImageViewer.tsx`
- `src/components/radiology/ImagingDetailDialog.tsx`
- `src/pages/app/radiology/ImagingOrderDetailPage.tsx`
- `src/components/patients/PatientImagingHistory.tsx`
- 3 language files for any new upload/save text if needed
- Supabase migration for a radiology images storage bucket and storage RLS

3. Implementation approach
- Create a dedicated storage bucket for radiology images.
- In `ImageCapturePage`, replace temporary-only uploads with real Supabase Storage uploads.
- Save uploaded file URLs/metadata into `imaging_results.images` when the study is completed, or upsert them immediately during capture.
- Normalize image handling across the app so all report screens accept both:
  - string URLs
  - object entries like `{ url, caption, file_name }`
- Update `PrintableImagingReport` to map normalized image URLs and render them reliably in the report.
- Update `ImageViewer` and radiology detail/history pages to use the same normalization helper so UI and print stay consistent.

4. Supabase work
- Add a storage bucket for radiology report/study images.
- Add secure storage policies scoped to the hospital/org pattern already used in the app.
- Keep access private or organization-scoped depending on the existing storage conventions in the project.

5. Important compatibility fix
- Add a shared normalization helper in radiology code:
  - if `result.images = ["url1", "url2"]` → convert to objects/usable URLs
  - if `result.images = [{ url: "..." }]` → use directly
- This prevents older saved data and newer uploads from breaking different screens.

6. What this will change for the user
- Uploaded radiology images will actually persist after capture.
- The completed/verified radiology report will show those uploaded images.
- Patient-side imaging history and imaging detail pages will show the same saved images consistently.
- Branding remains intact, and the printed report will include both report text and uploaded images.

7. Technical notes
- Current network data confirms the tested record has `imaging_results.images: []`, so the problem is not only display; the images were never saved.
- `PrintableImagingReport` already has an image section, but it currently assumes object-shaped image items and therefore is fragile.
- `ImagingDetailDialog`, `ImagingOrderDetailPage`, and `PatientImagingHistory` currently assume string arrays, so the app needs one unified format handler.

8. 3-language requirement
- If any new labels/toasts are added for upload persistence or saved study images, they should be added in English, Urdu, and Arabic.

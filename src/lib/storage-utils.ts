import { supabase } from "@/integrations/supabase/client";

/**
 * Generate a signed URL for a patient photo stored in the private patient-photos bucket.
 * If the URL is already a signed URL or external URL, returns it as-is.
 * If it's a storage path (e.g. "patientId/filename.jpg"), generates a signed URL.
 */
export async function getPatientPhotoSignedUrl(
  photoUrlOrPath: string | null | undefined
): Promise<string | null> {
  if (!photoUrlOrPath) return null;

  // If it looks like a full URL (legacy public URL or already signed), 
  // extract the storage path from it
  let storagePath = photoUrlOrPath;

  if (photoUrlOrPath.startsWith("http")) {
    // Extract path after /patient-photos/
    const match = photoUrlOrPath.match(/\/patient-photos\/(.+?)(\?|$)/);
    if (match) {
      storagePath = decodeURIComponent(match[1]);
    } else {
      // External URL or unrecognized format - return as-is
      return photoUrlOrPath;
    }
  }

  const { data, error } = await supabase.storage
    .from("patient-photos")
    .createSignedUrl(storagePath, 3600); // 1 hour expiry

  if (error || !data?.signedUrl) {
    console.error("Failed to create signed URL for patient photo:", error);
    return null;
  }

  return data.signedUrl;
}

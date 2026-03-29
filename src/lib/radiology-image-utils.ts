import { supabase } from "@/integrations/supabase/client";

export interface NormalizedImage {
  url: string;
  caption?: string;
  file_name?: string;
}

/**
 * Normalizes imaging result images from either string[] or object[] format
 * into a consistent NormalizedImage[] format.
 */
export function normalizeImagingImages(images: unknown[] | null | undefined): NormalizedImage[] {
  if (!Array.isArray(images) || images.length === 0) return [];

  return images
    .map((img): NormalizedImage | null => {
      if (typeof img === 'string') {
        return { url: img };
      }
      if (img && typeof img === 'object' && 'url' in img) {
        const obj = img as Record<string, unknown>;
        return {
          url: String(obj.url || ''),
          caption: obj.caption ? String(obj.caption) : undefined,
          file_name: obj.file_name ? String(obj.file_name) : undefined,
        };
      }
      return null;
    })
    .filter((img): img is NormalizedImage => img !== null && img.url.length > 0);
}

/**
 * Extract plain URL strings from normalized images (for ImageViewer compatibility)
 */
export function getImageUrls(images: unknown[] | null | undefined): string[] {
  return normalizeImagingImages(images).map(img => img.url);
}

/**
 * Upload a file to the radiology-images bucket and return a signed URL.
 */
export async function uploadRadiologyImage(
  file: File,
  orderId: string,
  organizationId: string
): Promise<{ url: string; file_name: string; path: string }> {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const storagePath = `${organizationId}/${orderId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('radiology-images')
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) throw uploadError;

  const { data: signedData, error: signedError } = await supabase.storage
    .from('radiology-images')
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365); // 1 year

  if (signedError || !signedData?.signedUrl) {
    throw signedError || new Error('Failed to create signed URL');
  }

  return {
    url: signedData.signedUrl,
    file_name: file.name,
    path: storagePath,
  };
}

/**
 * Generate fresh signed URLs for radiology images stored in the private bucket.
 */
export async function refreshRadiologyImageUrls(images: NormalizedImage[]): Promise<NormalizedImage[]> {
  return Promise.all(
    images.map(async (img) => {
      // If it has a path stored in the object, regenerate signed URL
      const imgAny = img as Record<string, unknown>;
      if (imgAny.path && typeof imgAny.path === 'string') {
        try {
          const { data } = await supabase.storage
            .from('radiology-images')
            .createSignedUrl(imgAny.path as string, 3600);
          if (data?.signedUrl) {
            return { ...img, url: data.signedUrl };
          }
        } catch {
          // Fall back to existing URL
        }
      }
      return img;
    })
  );
}

/**
 * QR Code generation utilities using QR Server API
 * No external library required
 */

export const generateQRCodeUrl = (data: string, size = 150): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
};

// Generate verification URL for invoice
export const getInvoiceVerificationUrl = (invoiceNumber: string, orgSlug?: string): string => {
  const slug = orgSlug || 'verify';
  return `https://healthos24.com/verify/${slug}/${invoiceNumber}`;
};

// Generate appointment verification URL
export const getAppointmentVerificationUrl = (tokenNumber: number, orgSlug?: string): string => {
  const slug = orgSlug || 'verify';
  return `https://healthos24.com/token/${slug}/${tokenNumber}`;
};

// Generate donor verification URL
export const getDonorVerificationUrl = (donorNumber: string, orgSlug?: string): string => {
  const slug = orgSlug || 'verify';
  return `https://healthos24.com/donor/${slug}/${donorNumber}`;
};

// Generate public campaign URL
export const getCampaignPublicUrl = (orgSlug: string, campaignNumber: string): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://healthos24.com';
  return `${baseUrl}/campaign/${orgSlug}/${campaignNumber}`;
};

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
  return `https://smart-hms.lovable.app/verify/${slug}/${invoiceNumber}`;
};

// Generate appointment verification URL
export const getAppointmentVerificationUrl = (tokenNumber: number, orgSlug?: string): string => {
  const slug = orgSlug || 'verify';
  return `https://smart-hms.lovable.app/token/${slug}/${tokenNumber}`;
};

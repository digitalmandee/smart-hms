/**
 * PHI Field-Level Masking Utility
 * HIPAA §164.312(e)(1) — Masks sensitive fields before writing to audit logs
 */

const DEFAULT_SENSITIVE_FIELDS = [
  'patient_name', 'first_name', 'last_name', 'full_name',
  'phone', 'mobile', 'contact_number', 'caller_phone',
  'cnic', 'national_id', 'ssn',
  'email', 'patient_email',
  'diagnosis', 'diagnosis_on_admission', 'discharge_diagnosis',
  'chief_complaint', 'clinical_notes', 'history_of_present_illness',
  'discharge_summary', 'discharge_instructions',
  'condition_summary', 'prehospital_care',
  'address', 'patient_address',
];

function maskString(value: string): string {
  if (!value || value.length <= 3) return '***';
  if (value.length <= 6) return value[0] + '***' + value[value.length - 1];
  return value.slice(0, 2) + '*'.repeat(Math.min(value.length - 4, 5)) + value.slice(-2);
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 7) return '***';
  return digits.slice(0, 3) + '***' + digits.slice(-3);
}

function maskEmail(value: string): string {
  const parts = value.split('@');
  if (parts.length !== 2) return maskString(value);
  const local = parts[0];
  const masked = local.length <= 2 ? '***' : local[0] + '***' + local[local.length - 1];
  return masked + '@' + parts[1];
}

function maskValue(key: string, value: unknown): unknown {
  if (typeof value !== 'string' || !value.trim()) return value;
  
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('email')) return maskEmail(value);
  if (lowerKey.includes('phone') || lowerKey.includes('mobile') || lowerKey.includes('contact')) return maskPhone(value);
  return maskString(value);
}

/**
 * Masks sensitive PHI fields in an object before audit logging.
 * Only top-level string fields matching known sensitive names are masked.
 */
export function maskPhiFields(
  data: Record<string, unknown> | null | undefined,
  additionalFields: string[] = []
): Record<string, unknown> | null | undefined {
  if (!data) return data;
  
  const sensitiveSet = new Set([
    ...DEFAULT_SENSITIVE_FIELDS,
    ...additionalFields.map(f => f.toLowerCase()),
  ]);

  const masked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveSet.has(key.toLowerCase()) && typeof value === 'string') {
      masked[key] = maskValue(key, value);
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

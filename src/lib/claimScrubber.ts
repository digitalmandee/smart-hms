/**
 * Claim Scrubbing / Validation Engine
 * Pre-submission rules for ICD-10 validation, duplicate detection, 
 * missing field checks, and auto-correction suggestions.
 */

export interface ScrubResult {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  field?: string;
  suggestion?: string;
}

export interface ClaimScrubInput {
  patient_insurance_id?: string;
  invoice_id?: string;
  claim_date?: string;
  total_amount?: number;
  icd_codes?: string[];
  pre_auth_number?: string;
  pre_auth_required?: boolean;
  drg_code?: string;
  items?: {
    service_code?: string;
    description?: string;
    quantity?: number;
    unit_price?: number;
    total_amount?: number;
  }[];
  // For duplicate detection
  existingClaims?: {
    claim_date: string;
    patient_insurance_id: string;
    total_amount: number;
    status: string;
  }[];
}

const ICD10_REGEX = /^[A-TV-Z]\d{2}(\.\d{1,4})?$/;
const CPT_REGEX = /^\d{5}$/;

export function scrubClaim(input: ClaimScrubInput): ScrubResult[] {
  const results: ScrubResult[] = [];

  // 1. Missing required fields
  if (!input.patient_insurance_id) {
    results.push({
      severity: "error",
      code: "MISSING_INSURANCE",
      message: "Patient insurance is required",
      field: "patient_insurance_id",
    });
  }

  if (!input.claim_date) {
    results.push({
      severity: "error",
      code: "MISSING_DATE",
      message: "Claim date is required",
      field: "claim_date",
    });
  }

  if (!input.total_amount || input.total_amount <= 0) {
    results.push({
      severity: "error",
      code: "INVALID_AMOUNT",
      message: "Total amount must be greater than zero",
      field: "total_amount",
      suggestion: "Verify the invoice total and line items",
    });
  }

  // 2. ICD-10 code validation
  if (!input.icd_codes || input.icd_codes.length === 0) {
    results.push({
      severity: "error",
      code: "MISSING_ICD",
      message: "At least one ICD-10 diagnosis code is required",
      field: "icd_codes",
      suggestion: "Add a primary diagnosis code (e.g., J06.9 for Upper respiratory infection)",
    });
  } else {
    input.icd_codes.forEach((code, idx) => {
      if (!ICD10_REGEX.test(code.trim().toUpperCase())) {
        results.push({
          severity: "error",
          code: "INVALID_ICD_FORMAT",
          message: `ICD-10 code "${code}" has invalid format`,
          field: `icd_codes[${idx}]`,
          suggestion: `Expected format: A00-Z99 with optional decimal (e.g., J06.9). Got "${code}"`,
        });
      }
    });
  }

  // 3. Service/CPT code validation on items
  if (!input.items || input.items.length === 0) {
    results.push({
      severity: "error",
      code: "NO_LINE_ITEMS",
      message: "Claim must have at least one service line item",
      field: "items",
    });
  } else {
    let itemsTotal = 0;
    input.items.forEach((item, idx) => {
      if (!item.service_code) {
        results.push({
          severity: "warning",
          code: "MISSING_SERVICE_CODE",
          message: `Line item ${idx + 1} "${item.description || ''}" has no CPT/service code`,
          field: `items[${idx}].service_code`,
          suggestion: "Add a CPT code for NPHIES submission",
        });
      } else if (CPT_REGEX.test(item.service_code)) {
        // Valid CPT
      } else if (item.service_code.length < 3) {
        results.push({
          severity: "warning",
          code: "SHORT_SERVICE_CODE",
          message: `Service code "${item.service_code}" on item ${idx + 1} seems too short`,
          field: `items[${idx}].service_code`,
        });
      }

      if ((item.quantity || 0) <= 0) {
        results.push({
          severity: "error",
          code: "INVALID_QUANTITY",
          message: `Line item ${idx + 1} has invalid quantity: ${item.quantity}`,
          field: `items[${idx}].quantity`,
        });
      }

      if ((item.unit_price || 0) < 0) {
        results.push({
          severity: "error",
          code: "NEGATIVE_PRICE",
          message: `Line item ${idx + 1} has negative unit price`,
          field: `items[${idx}].unit_price`,
        });
      }

      itemsTotal += item.total_amount || 0;
    });

    // Total mismatch check
    if (input.total_amount && Math.abs(itemsTotal - input.total_amount) > 0.01) {
      results.push({
        severity: "warning",
        code: "TOTAL_MISMATCH",
        message: `Line items total (${itemsTotal.toFixed(2)}) does not match claim total (${input.total_amount.toFixed(2)})`,
        suggestion: "Verify line item amounts match the claim total",
      });
    }
  }

  // 4. Pre-authorization check
  if (input.pre_auth_required && !input.pre_auth_number) {
    results.push({
      severity: "error",
      code: "MISSING_PREAUTH",
      message: "Pre-authorization is required by this insurance plan but none provided",
      field: "pre_auth_number",
      suggestion: "Submit a pre-authorization request before creating this claim",
    });
  }

  // 5. Duplicate claim detection (same patient + same date + same payer within 7 days)
  if (input.existingClaims && input.claim_date && input.patient_insurance_id) {
    const claimDate = new Date(input.claim_date);
    const duplicates = input.existingClaims.filter((existing) => {
      if (existing.patient_insurance_id !== input.patient_insurance_id) return false;
      if (existing.status === "rejected") return false;
      const existingDate = new Date(existing.claim_date);
      const diffDays = Math.abs(claimDate.getTime() - existingDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7 && Math.abs(existing.total_amount - (input.total_amount || 0)) < 1;
    });

    if (duplicates.length > 0) {
      results.push({
        severity: "warning",
        code: "POSSIBLE_DUPLICATE",
        message: `Found ${duplicates.length} similar claim(s) within 7 days for the same patient and payer`,
        suggestion: "Check if this is a duplicate submission before proceeding",
      });
    }
  }

  // 6. Claim date validation
  if (input.claim_date) {
    const cd = new Date(input.claim_date);
    const now = new Date();
    if (cd > now) {
      results.push({
        severity: "error",
        code: "FUTURE_DATE",
        message: "Claim date cannot be in the future",
        field: "claim_date",
      });
    }
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    if (cd < sixMonthsAgo) {
      results.push({
        severity: "warning",
        code: "OLD_CLAIM",
        message: "Claim date is more than 6 months old — may be rejected by payer",
        field: "claim_date",
      });
    }
  }

  return results;
}

export function hasErrors(results: ScrubResult[]): boolean {
  return results.some((r) => r.severity === "error");
}

export function hasWarnings(results: ScrubResult[]): boolean {
  return results.some((r) => r.severity === "warning");
}

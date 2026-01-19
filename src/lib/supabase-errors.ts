/**
 * Supabase/PostgREST Error Code Reference Utility
 * Translates error codes into user-friendly messages and debugging hints
 */

export const SUPABASE_ERROR_CODES: Record<string, { message: string; hint: string }> = {
  // PostgREST errors
  PGRST200: {
    message: "Relationship query failed",
    hint: "Check if foreign key constraints exist between tables",
  },
  PGRST116: {
    message: "No rows returned",
    hint: "The requested record does not exist or was filtered out",
  },
  PGRST204: {
    message: "Column not found",
    hint: "The specified column does not exist in the table schema",
  },
  
  // PostgreSQL errors
  "42501": {
    message: "Permission denied",
    hint: "RLS policy is blocking access to this data",
  },
  "42P01": {
    message: "Table not found",
    hint: "The specified table does not exist in the database",
  },
  "42703": {
    message: "Column not found",
    hint: "The specified column does not exist in the table",
  },
  "23503": {
    message: "Foreign key violation",
    hint: "Referenced record does not exist in the parent table",
  },
  "23505": {
    message: "Unique constraint violation",
    hint: "A record with this value already exists",
  },
  "23502": {
    message: "Not null violation",
    hint: "A required field is missing",
  },
  "22P02": {
    message: "Invalid input syntax",
    hint: "The provided value has an invalid format (e.g., invalid UUID)",
  },
};

export interface SupabaseError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}

/**
 * Get a user-friendly error message from a Supabase error
 */
export function getErrorMessage(error: SupabaseError): string {
  const known = SUPABASE_ERROR_CODES[error.code as string];
  if (known) {
    return `${known.message}: ${error.message}`;
  }
  return error.message;
}

/**
 * Get a debugging hint for an error code
 */
export function getErrorHint(code?: string): string | null {
  if (!code) return null;
  const known = SUPABASE_ERROR_CODES[code];
  return known?.hint || null;
}

/**
 * Categorize error type for logging purposes
 */
export function categorizeError(code?: string): 'relationship' | 'permission' | 'constraint' | 'not_found' | 'unknown' {
  if (!code) return 'unknown';
  
  if (code === 'PGRST200' || code === 'PGRST204') return 'relationship';
  if (code === '42501') return 'permission';
  if (code === 'PGRST116' || code === '42P01' || code === '42703') return 'not_found';
  if (code.startsWith('23')) return 'constraint';
  
  return 'unknown';
}

/**
 * Format error for logging with all available context
 */
export function formatErrorForLogging(error: SupabaseError, context?: Record<string, unknown>): {
  code: string | undefined;
  message: string;
  hint: string | null;
  category: string;
  details: string | undefined;
  context: Record<string, unknown> | undefined;
} {
  return {
    code: error.code,
    message: error.message,
    hint: getErrorHint(error.code) || error.hint || null,
    category: categorizeError(error.code),
    details: error.details,
    context,
  };
}

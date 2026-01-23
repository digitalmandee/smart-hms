/**
 * Centralized Logging Utility for HMS
 * Provides structured, consistent logging across all modules
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
}

// Log level priority for filtering
const LOG_LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Minimum log level to output (can be configured)
const MIN_LOG_LEVEL: LogLevel = import.meta.env.DEV ? 'DEBUG' : 'INFO';

class Logger {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
  }

  private formatContext(context?: LogContext): string {
    if (!context || Object.keys(context).length === 0) return '';
    
    const lines = Object.entries(context)
      .map(([key, value]) => {
        const formattedValue = typeof value === 'object' 
          ? JSON.stringify(value, null, 2) 
          : String(value);
        return `  → ${key}: ${formattedValue}`;
      })
      .join('\n');
    
    return '\n' + lines;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module: this.module,
      message,
    };

    if (context && Object.keys(context).length > 0) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private output(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level}] [${entry.module}]`;
    const contextStr = this.formatContext(entry.context);
    const fullMessage = `${prefix} ${entry.message}${contextStr}`;

    switch (entry.level) {
      case 'DEBUG':
        console.debug(fullMessage);
        break;
      case 'INFO':
        console.info(fullMessage);
        break;
      case 'WARN':
        console.warn(fullMessage);
        if (entry.error) {
          console.warn('  Error:', entry.error.message);
        }
        break;
      case 'ERROR':
        console.error(fullMessage);
        if (entry.error) {
          console.error('  Error:', entry.error.message);
          if (entry.error.stack) {
            console.error('  Stack:', entry.error.stack);
          }
        }
        break;
    }
  }

  /**
   * Debug level - detailed information for debugging
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('DEBUG')) return;
    const entry = this.createLogEntry('DEBUG', message, context);
    this.output(entry);
  }

  /**
   * Info level - general information about system operation
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('INFO')) return;
    const entry = this.createLogEntry('INFO', message, context);
    this.output(entry);
  }

  /**
   * Warn level - potential issues or unexpected behavior
   */
  warn(message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog('WARN')) return;
    const entry = this.createLogEntry('WARN', message, context, error);
    this.output(entry);
  }

  /**
   * Error level - errors that need attention
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog('ERROR')) return;
    
    const errorObj = error instanceof Error 
      ? error 
      : error 
        ? new Error(String(error)) 
        : undefined;
    
    const entry = this.createLogEntry('ERROR', message, context, errorObj);
    this.output(entry);
  }

  /**
   * Log start of an operation with timing
   */
  startOperation(operation: string, context?: LogContext): () => void {
    const startTime = performance.now();
    this.debug(`${operation} started`, context);
    
    return () => {
      const duration = Math.round(performance.now() - startTime);
      this.debug(`${operation} completed`, { ...context, durationMs: duration });
    };
  }

  /**
   * Create a child logger with additional module context
   */
  child(subModule: string): Logger {
    return new Logger(`${this.module}:${subModule}`);
  }
}

/**
 * Create a logger instance for a specific module
 * @param module - The module name (e.g., 'POS', 'AUTH', 'LAB')
 */
export function createLogger(module: string): Logger {
  return new Logger(module);
}

// Pre-created loggers for common modules
export const authLogger = createLogger('AUTH');
export const patientLogger = createLogger('PATIENT');
export const appointmentLogger = createLogger('APPOINTMENT');
export const opdLogger = createLogger('OPD');
export const posLogger = createLogger('POS');
export const labLogger = createLogger('LAB');
export const emergencyLogger = createLogger('EMERGENCY');
export const ipdLogger = createLogger('IPD');
export const billingLogger = createLogger('BILLING');
export const inventoryLogger = createLogger('INVENTORY');
export const hrLogger = createLogger('HR');
export const bloodBankLogger = createLogger('BLOOD_BANK');
export const pharmacyLogger = createLogger('PHARMACY');
export const kioskLogger = createLogger('KIOSK');
export const settingsLogger = createLogger('SETTINGS');

// Additional module loggers
export const radiologyLogger = createLogger('RADIOLOGY');
export const otLogger = createLogger('OT');
export const accountsLogger = createLogger('ACCOUNTS');
export const navigationLogger = createLogger('NAVIGATION');
export const systemLogger = createLogger('SYSTEM');
export const returnsLogger = createLogger('RETURNS');
export const inventoryOpsLogger = createLogger('INVENTORY_OPS');
export const admissionsLogger = createLogger('ADMISSIONS');
export const servicesLogger = createLogger('SERVICES');

export default Logger;

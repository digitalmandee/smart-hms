/**
 * Edge Function Logger Utility
 * Provides structured logging for Supabase Edge Functions
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  function: string;
  requestId?: string;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
  durationMs?: number;
}

class EdgeLogger {
  private functionName: string;
  private requestId?: string;
  private startTime: number;

  constructor(functionName: string, requestId?: string) {
    this.functionName = functionName;
    this.requestId = requestId || crypto.randomUUID().slice(0, 8);
    this.startTime = Date.now();
  }

  private formatContext(context?: LogContext): string {
    if (!context || Object.keys(context).length === 0) return '';
    
    const lines = Object.entries(context)
      .map(([key, value]) => {
        const formattedValue = typeof value === 'object' 
          ? JSON.stringify(value) 
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
      function: this.functionName,
      requestId: this.requestId,
      message,
      durationMs: Date.now() - this.startTime,
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
    const prefix = `[${entry.timestamp}] [${entry.level}] [${entry.function}] [${entry.requestId}] (+${entry.durationMs}ms)`;
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

  debug(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('DEBUG', message, context);
    this.output(entry);
  }

  info(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('INFO', message, context);
    this.output(entry);
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    const entry = this.createLogEntry('WARN', message, context, error);
    this.output(entry);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorObj = error instanceof Error 
      ? error 
      : error 
        ? new Error(String(error)) 
        : undefined;
    
    const entry = this.createLogEntry('ERROR', message, context, errorObj);
    this.output(entry);
  }

  /**
   * Log function invocation
   */
  invoked(context?: LogContext): void {
    this.info('Function invoked', context);
  }

  /**
   * Log successful completion
   */
  success(message: string, context?: LogContext): void {
    this.info(`✓ ${message}`, { ...context, status: 'success' });
  }

  /**
   * Log external API call
   */
  apiCall(provider: string, endpoint: string, context?: LogContext): void {
    this.debug(`API call to ${provider}`, { endpoint, ...context });
  }

  /**
   * Log external API response
   */
  apiResponse(provider: string, statusCode: number, context?: LogContext): void {
    const level = statusCode >= 400 ? 'WARN' : 'DEBUG';
    const entry = this.createLogEntry(level, `API response from ${provider}`, { statusCode, ...context });
    this.output(entry);
  }

  /**
   * Get elapsed time since logger creation
   */
  getElapsedMs(): number {
    return Date.now() - this.startTime;
  }
}

/**
 * Create a logger for an edge function
 * @param functionName - The edge function name
 * @param requestId - Optional request ID for tracing
 */
export function createEdgeLogger(functionName: string, requestId?: string): EdgeLogger {
  return new EdgeLogger(functionName, requestId);
}

export default EdgeLogger;

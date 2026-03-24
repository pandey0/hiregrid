import * as Sentry from "@sentry/nextjs";
import { crypto } from "better-auth/utils";

/**
 * PRODUCTION-READY LOGGING SYSTEM
 * Features:
 * 1. Structured JSON output
 * 2. Trace ID Correlation
 * 3. Automatic Sentry Integration
 * 4. Performance Timing
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  userId?: string;
  orgId?: string;
  programId?: number;
  traceId?: string;
  durationMs?: number;
  [key: string]: any;
}

class Logger {
  private isProduction = process.env.NODE_ENV === "production";

  private formatLog(level: LogLevel, message: string, context: LogContext) {
    return {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...context,
    };
  }

  /**
   * Generates a unique trace ID for correlating logs across a single operation.
   */
  generateTraceId() {
    return Math.random().toString(36).substring(2, 15);
  }

  info(message: string, context: LogContext = {}) {
    const log = this.formatLog("info", message, context);
    console.log(JSON.stringify(log));
    
    Sentry.addBreadcrumb({
      category: "log",
      message,
      level: "info",
      data: context,
    });
  }

  warn(message: string, context: LogContext = {}) {
    const log = this.formatLog("warn", message, context);
    console.warn(JSON.stringify(log));
    
    Sentry.addBreadcrumb({
      category: "log",
      message,
      level: "warning",
      data: context,
    });
  }

  error(message: string, error: any, context: LogContext = {}) {
    const log = this.formatLog("error", message, {
      ...context,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.error(JSON.stringify(log));

    // Send to Sentry with full context
    Sentry.withScope((scope) => {
      scope.setLevel("error");
      if (context.userId) scope.setUser({ id: context.userId });
      if (context.traceId) scope.setTag("traceId", context.traceId);
      if (context.programId) scope.setTag("programId", context.programId.toString());
      
      scope.setExtras(context);
      Sentry.captureException(error instanceof Error ? error : new Error(message));
    });
  }

  /**
   * TRACE WRAPPER:
   * Wraps an entire operation to track duration, auto-log start/end,
   * and capture any unhandled failures with a Trace ID.
   */
  async trace<T>(
    operationName: string,
    context: LogContext,
    fn: (traceId: string) => Promise<T>
  ): Promise<T> {
    const traceId = context.traceId || this.generateTraceId();
    const start = performance.now();
    
    this.info(`[START] ${operationName}`, { ...context, traceId });

    try {
      const result = await fn(traceId);
      const durationMs = Math.round(performance.now() - start);
      
      this.info(`[SUCCESS] ${operationName}`, { 
        ...context, 
        traceId, 
        durationMs 
      });
      
      return result;
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      
      this.error(`[FAILURE] ${operationName}`, err, { 
        ...context, 
        traceId, 
        durationMs 
      });
      
      throw err;
    }
  }
}

export const logger = new Logger();

import { createSystemLogContainer } from '../container';

export interface LogSystemParams {
  level?: 'error' | 'warn' | 'info';
  source: 'checkout' | 'payment' | 'storage' | 'auth' | 'booking' | 'departure' | 'tour' | 'system';
  message: string;
  error?: unknown;
  path?: string;
  action?: string;
  context?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

/**
 * Universal error and activity logger that persists entries directly to PostgreSQL (`app_system_logs`).
 * Fail-safe: if database write fails for any reason, it outputs to console and does not throw.
 */
export async function logSystemError(params: LogSystemParams): Promise<void> {
  const level = params.level ?? 'error';
  const source = params.source ?? 'system';
  const err = params.error;

  const stack = err instanceof Error ? err.stack : undefined;
  let errorName: string | undefined;

  if (err instanceof Error) {
    errorName = err.name;
  } else if (typeof err === 'object' && err !== null && 'code' in err) {
    errorName = String((err as { code: unknown }).code);
  } else if (typeof err === 'string') {
    errorName = 'StringError';
  }

  // Always output formatted log to stdout/stderr for dev server & host platform logs
  console.error(`[SYSTEM_LOG][${level.toUpperCase()}][${source}] ${params.message}`, {
    errorName,
    path: params.path,
    action: params.action,
    context: params.context,
    error: err,
  });

  try {
    const container = createSystemLogContainer();
    await container.createService.execute({
      level,
      source,
      message: params.message,
      errorName,
      stack,
      path: params.path,
      action: params.action,
      context: params.context,
      ip: params.ip,
      userAgent: params.userAgent,
      status: 'unread',
    });
  } catch (dbErr) {
    // Fail-safe: logging should NEVER interrupt user flows
    console.error('CRITICAL: Failed to persist error to app_system_logs:', dbErr);
  }
}

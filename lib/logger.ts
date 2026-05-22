type LogMeta = Record<string, unknown>;

interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  event: string;
  traceId?: string;
  meta?: LogMeta;
  error?: Error | unknown;
}

class StructuredLogger {
  private format(entry: LogEntry) {
    const payload = {
      timestamp: new Date().toISOString(),
      ...entry,
      ...(entry.error instanceof Error
        ? {
            errorName: entry.error.name,
            errorMessage: entry.error.message,
            stack: entry.error.stack,
          }
        : { rawError: entry.error }),
    };

    // Remove undefined fields
    return JSON.stringify(payload, (key, value) => (value === undefined ? undefined : value));
  }

  info(entry: Omit<LogEntry, 'level' | 'error'>) {
    console.log(this.format({ ...entry, level: 'info' }));
  }

  warn(entry: Omit<LogEntry, 'level'>) {
    console.warn(this.format({ ...entry, level: 'warn' }));
  }

  error(entry: Omit<LogEntry, 'level'>) {
    console.error(this.format({ ...entry, level: 'error' }));
  }

  debug(entry: Omit<LogEntry, 'level' | 'error'>) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.format({ ...entry, level: 'debug' }));
    }
  }
}

export const logger = new StructuredLogger();

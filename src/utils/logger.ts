enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private createEntry(
    level: LogLevel,
    module: string,
    message: string,
    data?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          code: (error as any).code,
        },
      }),
    };
  }

  private log(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const prefix = `[${entry.timestamp}] [${entry.level}] [${entry.module}]`;
    const logMessage = entry.data ? `${entry.message} ${JSON.stringify(entry.data)}` : entry.message;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.log(prefix, logMessage);
        break;
      case LogLevel.INFO:
        console.log(prefix, logMessage);
        break;
      case LogLevel.WARN:
        console.warn(prefix, logMessage);
        break;
      case LogLevel.ERROR:
        console.error(prefix, logMessage);
        if (entry.error?.stack) {
          console.error('Stack trace:', entry.error.stack);
        }
        break;
    }
  }

  debug(module: string, message: string, data?: Record<string, any>) {
    this.log(this.createEntry(LogLevel.DEBUG, module, message, data));
  }

  info(module: string, message: string, data?: Record<string, any>) {
    this.log(this.createEntry(LogLevel.INFO, module, message, data));
  }

  warn(module: string, message: string, data?: Record<string, any>) {
    this.log(this.createEntry(LogLevel.WARN, module, message, data));
  }

  error(module: string, message: string, error?: Error, data?: Record<string, any>) {
    this.log(this.createEntry(LogLevel.ERROR, module, message, data, error));
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByModule(module: string): LogEntry[] {
    return this.logs.filter((log) => log.module === module);
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return this.logs
      .map(
        (log) =>
          `${log.timestamp} [${log.level}] [${log.module}] ${log.message}${log.data ? ' ' + JSON.stringify(log.data) : ''}${log.error ? ' ERROR: ' + log.error.message : ''}`
      )
      .join('\n');
  }
}

export const logger = new Logger();

import { noop } from '@sel/utils';
import { injectableClass } from 'ditox';

export interface Logger {
  log: typeof console.log;
  warn: typeof console.warn;
  error: typeof console.error;
}

export class ConsoleLogger {
  static inject = injectableClass(this);

  log = this.createLog('log');
  warn = this.createLog('warn');
  error = this.createLog('error');

  private createLog(level: keyof Logger) {
    return (...args: unknown[]): void => {
      // eslint-disable-next-line no-console
      console[level](`[${this.date}]`, `[${level}]`, ...args);
    };
  }

  private get date() {
    return new Date().toISOString().replace('T', ' ').replace(/\..*$/, '');
  }
}

export class StubLogger implements Logger {
  lines: Record<keyof Logger, unknown[]> = {
    log: [],
    warn: [],
    error: [],
  };

  log(...args: unknown[]): void {
    this.lines['log'].push(args);
  }

  warn(...args: unknown[]): void {
    this.lines['warn'].push(args);
  }

  error(...args: unknown[]): void {
    this.lines['error'].push(args);
  }
}

export class NoopLogger implements Logger {
  log = noop;
  warn = noop;
  error = noop;
}

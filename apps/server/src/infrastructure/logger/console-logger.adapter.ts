import { injectableClass } from 'ditox';

import { LoggerPort } from './logger.port';

export class ConsoleLogger implements LoggerPort {
  static inject = injectableClass(this);

  error(...args: unknown[]): void {
    this.log('error', ...args);
  }

  warn(...args: unknown[]): void {
    this.log('warn', ...args);
  }

  info(...args: unknown[]): void {
    this.log('info', ...args);
  }

  private log(level: keyof LoggerPort, ...args: unknown[]) {
    // eslint-disable-next-line no-console
    console[level](...args);
  }
}

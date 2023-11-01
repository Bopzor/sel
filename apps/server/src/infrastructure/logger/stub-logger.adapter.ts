import { LoggerPort } from './logger.port';

export class StubLogger implements LoggerPort {
  lines: Record<keyof LoggerPort, unknown[]> = {
    error: [],
    info: [],
    warn: [],
  };

  error(...args: unknown[]): void {
    this.lines['error'].push(...args);
  }

  warn(...args: unknown[]): void {
    this.lines['warn'].push(...args);
  }

  info(...args: unknown[]): void {
    this.lines['info'].push(...args);
  }
}

export interface Logger {
  log: typeof console.log;
  warn: typeof console.warn;
  error: typeof console.error;
}

export class StubLogger implements Logger {
  lines: Record<keyof Logger, unknown[]> = {
    log: [],
    warn: [],
    error: [],
  };

  log(...args: unknown[]): void {
    this.lines['log'].push(...args);
  }

  warn(...args: unknown[]): void {
    this.lines['warn'].push(...args);
  }

  error(...args: unknown[]): void {
    this.lines['error'].push(...args);
  }
}

import { ErrorReporterPort } from './error-reporter.port';

export class TestErrorReporterAdapter implements ErrorReporterPort {
  async report(...args: unknown[]): Promise<void> {
    if (args[0] instanceof Error) {
      throw Object.assign(args[0]);
    } else {
      throw Object.assign(new Error('An error was reported during tests'), { args });
    }
  }
}

import { ErrorReporterPort } from './error-reporter.port';

export class TestErrorReporterAdapter implements ErrorReporterPort {
  async report(...args: unknown[]): Promise<void> {
    throw Object.assign(new Error('An error was reported during tests'), { args });
  }
}

import { ErrorReporterPort } from './error-reporter.port';

export class StubErrorReporterAdapter implements ErrorReporterPort {
  reported = new Array<unknown[]>();

  async report(...args: unknown[]): Promise<void> {
    this.reported.push(args);
  }
}

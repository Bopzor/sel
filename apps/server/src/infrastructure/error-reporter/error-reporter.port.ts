export interface ErrorReporterPort {
  report(...args: unknown[]): Promise<void>;
}

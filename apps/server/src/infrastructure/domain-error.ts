export class DomainError extends Error {
  public readonly status?: number;

  constructor(
    message?: string,
    public readonly payload?: Record<string, unknown>,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

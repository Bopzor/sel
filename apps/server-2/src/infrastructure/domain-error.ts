export class DomainError extends Error {
  public readonly status?: number;

  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DomainError<Payload = never> extends Error {
  public readonly payload: Payload;

  constructor(message: string, ...args: Payload extends never ? [] : [Payload]) {
    super(message);
    this.payload = args[0] as Payload;
  }
}

export class DomainError<Payload = never> extends Error {
  public readonly payload: Payload;

  constructor(message: string, ...args: Payload extends never ? [] : [Payload]) {
    super(message);
    this.payload = args[0] as Payload;
  }
}

export class EntityNotFound extends DomainError<{ entity: string; id: string }> {
  constructor(message: string, entity: string, entityId: string) {
    super(message, { entity, id: entityId });
  }
}

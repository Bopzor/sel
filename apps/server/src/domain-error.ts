import { HttpStatus } from './http-status';

export class DomainError<Payload = never> extends Error {
  public readonly status?: number;
  public readonly payload: Payload;

  constructor(message: string, ...args: Payload extends never ? [] : [Payload]) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.payload = args[0] as Payload;
  }
}

export class EntityNotFound extends DomainError<{ entity: string; id: string }> {
  status = HttpStatus.notFound;

  constructor(message: string, entity: string, entityId: string) {
    super(message, { entity, id: entityId });
  }
}

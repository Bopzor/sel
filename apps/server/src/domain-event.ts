export abstract class DomainEvent {
  abstract entity: string;

  public readonly entityId: string;
  public readonly type: string;

  constructor(entityId: string) {
    this.entityId = entityId;
    this.type = new.target.name;
  }
}

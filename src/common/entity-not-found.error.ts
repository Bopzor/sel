export class EntityNotFoundError extends Error {
  constructor(public readonly entityName: string, public readonly where?: Record<string, unknown>) {
    super(`${entityName} not found`);
  }
}

export function assertEntity(
  entityName: string,
  entity?: unknown,
  where?: Record<string, unknown>
): asserts entity;

export function assertEntity<Entity>(
  entityClass: { new (...args: never[]): Entity },
  entity?: Entity,
  where?: Record<string, unknown>
): asserts entity;

export function assertEntity<Entity>(
  entityNameOrClass: string | { new (...args: never[]): Entity },
  entity?: Entity,
  where?: Record<string, unknown>
): asserts entity {
  const entityName = typeof entityNameOrClass === 'string' ? entityNameOrClass : entityNameOrClass.name;

  if (entity === undefined) {
    throw new EntityNotFoundError(entityName, where);
  }
}

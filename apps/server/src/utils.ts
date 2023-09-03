export function assert<T>(value: T, message?: string): asserts value {
  if (!value) {
    throw new Error(message ?? 'Assertion error');
  }
}

export type Factory<T> = (overrides?: Partial<T>) => T;

export function createFactory<T>(getDefault: () => T): Factory<T> {
  return (overrides) => ({ ...getDefault(), ...overrides });
}

export function createId() {
  return Math.random().toString(36).slice(-6);
}

export function hasId<T extends { id: string }>(value: T['id']) {
  return (obj: T) => obj.id === value;
}

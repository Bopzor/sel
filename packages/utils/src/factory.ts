export type Factory<T> = (overrides?: Partial<T>) => T;

export function createFactory<T>(getDefault: () => T): Factory<T> {
  return (overrides) => ({ ...getDefault(), ...overrides });
}

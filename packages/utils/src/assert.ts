export function assert<T>(value: T, message?: string): asserts value {
  if (!value) {
    throw new Error(message ?? 'Assertion error');
  }
}

export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export function defined<T>(value: T | undefined, message?: string): T {
  assert(value, message);
  return value;
}

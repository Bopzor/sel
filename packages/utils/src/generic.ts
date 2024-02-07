export function identity<T>(value: T) {
  return value;
}

export function not<Args extends unknown[]>(predicate: (...args: Args) => boolean) {
  return (...args: Args) => !predicate(...args);
}

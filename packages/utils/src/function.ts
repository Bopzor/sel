export function noop() {}

export function negate<Args extends unknown[]>(predicate: (...args: Args) => boolean) {
  return (...args: Args) => !predicate(...args);
}

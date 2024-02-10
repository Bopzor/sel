export function keys<T extends object>(obj: T) {
  return Object.keys(obj) as Array<keyof T>;
}

export function entries<T extends object>(obj: T) {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

export function hasProperty<T, K extends keyof T>(property: K, value: T[K]) {
  return (element: T) => element[property] === value;
}

export function toObject<T, K extends PropertyKey, V>(
  array: T[],
  getKey: (item: T) => K,
  getValue: (item: T) => V,
): Record<K, V> {
  return array.reduce(
    (obj, item) => ({
      ...obj,
      [getKey(item)]: getValue(item),
    }),
    {} as Record<K, V>,
  );
}

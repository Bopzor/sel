import { identity } from './generic';

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
  getKey: (item: T, index: number) => K,
  getValue: (item: T, index: number) => V,
): Record<K, V> {
  return array.reduce(
    (obj, item, index) => ({
      ...obj,
      [getKey(item, index)]: getValue(item, index),
    }),
    {} as Record<K, V>,
  );
}

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return toObject(keys, identity, (key) => obj[key]) as Pick<T, K>;
}

export async function awaitProperties<T extends object>(obj: T): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  const results = await Promise.all(Object.values(obj));

  return toObject(
    keys(obj),
    (key) => key,
    (key, index) => results[index],
  );
}

export function createArray<T>(length: number, createElement: (index: number) => T) {
  return Array(length)
    .fill(null)
    .map((_, index) => createElement(index));
}

export function first<T>(array: T[]) {
  return array[0];
}

export function last<T>(array: T[]) {
  return array[array.length - 1];
}

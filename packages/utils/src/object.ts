export function hasProperty<T, K extends keyof T>(property: K, value: T[K]) {
  return (element: T) => element[property] === value;
}

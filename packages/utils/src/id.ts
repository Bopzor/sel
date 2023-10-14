export function createId() {
  return Math.random().toString(36).slice(-6);
}

export function hasId<T extends { id: string }>(value: T['id']) {
  return (obj: T) => obj.id === value;
}

export function getId<T extends { id: string }>(value: T) {
  return value.id;
}

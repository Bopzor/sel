import { hasProperty } from './object';

export function createId() {
  return Math.random().toString(36).slice(-6);
}

export const hasId = <T extends { id?: string }>(id: string) => {
  return hasProperty<T, 'id'>('id', id);
};

export function getId<T extends { id: string }>(value: T) {
  return value.id;
}

import { Entity } from './ddd/entity';

export type Factory<T, P = Partial<T>> = (overrides?: P) => T;

export type EntityFactory<E extends Entity> = E extends Entity<infer P> ? Factory<E, Partial<P>> : never;

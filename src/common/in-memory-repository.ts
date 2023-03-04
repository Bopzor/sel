import clone from 'lodash.clonedeep';

import { ClassType } from '../app/api.context';

import { Entity } from './ddd/entity';

export interface InMemoryDatabase {
  getEntities<E extends Entity>(EntityClass: ClassType<E>): Map<string, E>;
}

export abstract class InMemoryRepository<Item extends Entity> {
  protected abstract entity: ClassType<Item>;

  constructor(protected readonly db: InMemoryDatabase) {}

  private get items() {
    return this.db.getEntities(this.entity);
  }

  async findById(id: string): Promise<Item | undefined> {
    return this.find((item) => item.id === id);
  }

  async save(item: Item): Promise<void> {
    this.add(item);
  }

  clear() {
    this.items.clear();
  }

  all() {
    return Array.from(this.items.values()).map(clone);
  }

  get(identifier: string) {
    return clone(this.items.get(identifier));
  }

  add(item: Item) {
    return clone(this.items.set(item.id, clone(item)));
  }

  find(predicate: (item: Item) => boolean) {
    return this.all().find(predicate);
  }

  filter(predicate: (item: Item) => boolean) {
    return this.all().filter(predicate);
  }
}

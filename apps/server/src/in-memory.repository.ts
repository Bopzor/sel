import { defined } from '@sel/utils';
import clone from 'lodash.clonedeep';

export abstract class InMemoryRepository<Item extends { id: string }> {
  private items = new Map<string, Item>();

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
    return this.set(item.id, item);
  }

  set(id: string, item: Item) {
    this.items.set(id, clone(item));
    return defined(this.get(id));
  }

  delete(id: string) {
    this.items.delete(id);
  }

  find(predicate: (item: Item) => boolean) {
    return this.all().find(predicate);
  }

  filter(predicate: (item: Item) => boolean) {
    return this.all().filter(predicate);
  }
}

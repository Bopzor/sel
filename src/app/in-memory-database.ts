import { Entity } from '../common/ddd/entity';
import { InMemoryDatabaseInterface } from '../common/in-memory-repository';
import { Member } from '../modules/members/entities/member.entity';
import { Request } from '../modules/requests/entities/request.entity';
import { ClassType } from '../utils/class-type';

export class InMemoryDatabase implements InMemoryDatabaseInterface {
  private db = new Map<ClassType<Entity>, Map<string, Entity>>([
    [Request, new Map()],
    [Member, new Map()],
  ]);

  getEntities<E extends Entity>(EntityClass: ClassType<E>): Map<string, E> {
    return this.db.get(EntityClass) as Map<string, E>;
  }

  setEntity(entity: Entity) {
    this.db.get(entity.constructor as ClassType<Entity>)?.set(entity.id, entity);
  }
}

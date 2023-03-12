import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import type { EntityManagerType } from '../../../../api/persistence/types';
import { SqlMemberEntity } from '../../../members/api/entities/sql-member.entity';
import { Request } from '../../entities/request.entity';

@Entity({ tableName: 'requests' })
export class SqlRequestEntity {
  constructor(em: EntityManagerType, request: Request) {
    this.id = request.id;
    this.requester = em.getReference(SqlMemberEntity, request.requesterId);
    this.title = request.title;
    this.description = request.description;
    this.creationDate = request.creationDate.asDate;
    this.lastEditionDate = request.lastEditionDate.asDate;
  }

  @PrimaryKey()
  id!: string;

  @ManyToOne({ eager: true })
  requester!: SqlMemberEntity;

  @Property()
  title!: string;

  @Property({ columnType: 'text' })
  description!: string;

  @Property()
  creationDate!: Date;

  @Property()
  lastEditionDate!: Date;
}

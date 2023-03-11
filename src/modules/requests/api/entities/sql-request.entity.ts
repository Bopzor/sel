import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { SqlMemberEntity } from '../../../members/api/entities/sql-member.entity';

@Entity({ tableName: 'requests' })
export class SqlRequestEntity {
  @PrimaryKey()
  id!: string;

  @ManyToOne()
  requester!: SqlMemberEntity;

  @Property()
  title!: string;

  @Property()
  description!: string;

  @Property()
  creationDate!: Date;

  @Property()
  lastEditionDate!: Date;
}

import { Entity, PrimaryKey } from '@mikro-orm/core';

@Entity({ tableName: 'members' })
export class SqlMemberEntity {
  @PrimaryKey()
  id!: string;
}

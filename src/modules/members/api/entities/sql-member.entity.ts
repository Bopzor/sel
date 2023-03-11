import { Entity, JsonType, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'members' })
export class SqlMemberEntity {
  @PrimaryKey()
  id!: string;

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property()
  email!: string;

  @Property()
  phoneNumber!: string;

  @Property({ type: JsonType })
  address!: Address;
}

type Address = {
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string;
  position: [lat: number, lng: number];
};

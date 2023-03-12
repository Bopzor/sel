import { Entity, JsonType, PrimaryKey, Property } from '@mikro-orm/core';

import { Member } from '../../entities/member.entity';

@Entity({ tableName: 'members' })
export class SqlMemberEntity {
  constructor(member: Member) {
    this.id = member.id;
    this.firstName = member.firstName;
    this.lastName = member.lastName;
    this.email = member.email;
    this.phoneNumber = member.phoneNumber;

    this.address = {
      line1: member.address.line1,
      line2: member.address.line2,
      postalCode: member.address.postalCode,
      city: member.address.city,
      country: member.address.country,
      position: member.address.position,
    };
  }

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

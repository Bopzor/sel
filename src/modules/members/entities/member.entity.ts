import { Entity } from '../../../common/ddd/entity';

import { Address } from './address.value-object';

type MemberProps = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: Address;
};

export class Member extends Entity<MemberProps> {
  get id() {
    return this.props.id;
  }

  get firstName() {
    return this.props.firstName;
  }

  get lastName() {
    return this.props.lastName;
  }

  get fullName() {
    return [this.firstName, this.lastName].join(' ');
  }

  get email() {
    return this.props.email;
  }

  get phoneNumber() {
    return this.props.phoneNumber;
  }

  get address() {
    return this.props.address;
  }
}

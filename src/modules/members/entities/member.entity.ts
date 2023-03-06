import { Entity } from '../../../common/ddd/entity';

type MemberProps = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
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
}

import { Entity } from '../../../common/ddd/entity';

type MemberProps = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export class Member extends Entity<MemberProps> {
  get id() {
    return this.props.id;
  }

  get email() {
    return this.props.email;
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
}

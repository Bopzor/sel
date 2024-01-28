import { EntityNotFound } from '../domain-error';

export class MemberNotFound extends EntityNotFound {
  constructor(memberId: string) {
    super('Member not found', 'member', memberId);
  }
}

import { AsyncLocalStorage } from 'node:async_hooks';

import { MemberRole } from '@sel/shared';
import { defined } from '@sel/utils';
import { RequestHandler } from 'express';

import { Member } from 'src/modules/member/member.entities';

import { Forbidden, Unauthorized } from './http';

const storage = new AsyncLocalStorage<Member>();

export function provideAuthenticatedMember(member: Member, next: () => void) {
  storage.run(member, next);
}

export function getAuthenticatedMemberUnsafe() {
  return storage.getStore();
}

export function getAuthenticatedMember() {
  return defined(getAuthenticatedMemberUnsafe(), 'No authenticated member in execution context');
}

export function hasRoles(roles: MemberRole[]): RequestHandler {
  return (req, res, next) => {
    const member = getAuthenticatedMemberUnsafe();

    if (!member) {
      next(new Unauthorized('Authentication required'));
    } else if (roles.some((role) => !member.roles.includes(role))) {
      next(new Forbidden('Missing roles'));
    } else {
      next();
    }
  };
}

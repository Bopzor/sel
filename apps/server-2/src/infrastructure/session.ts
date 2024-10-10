import { AsyncLocalStorage } from 'node:async_hooks';

import { defined } from '@sel/utils';
import { RequestHandler } from 'express';

import { Member } from 'src/modules/member/member.entities';

import { Unauthorized } from './http';

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

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!getAuthenticatedMemberUnsafe()) {
    next(new Unauthorized('Authentication required'));
  } else {
    next();
  }
};

import { beforeEach, describe, expect, it } from 'vitest';

import { createMember } from '../members/entities';

import { AuthenticationError, SessionProvider } from './session.provider';

describe('[Unit] SessionProvider', () => {
  let provider: SessionProvider;

  beforeEach(() => {
    provider = new SessionProvider();
  });

  it('retrieves a provided member', () => {
    const member = createMember();

    expect.assertions(1);

    provider.provide(member, () => {
      expect(provider.getMember()).toEqual(member);
    });
  });

  it('throws an AuthenticationError when no member is provided', () => {
    expect(() => provider.getMember()).toThrow(AuthenticationError);
  });
});

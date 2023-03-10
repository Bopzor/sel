import { afterEach, beforeEach } from 'vitest';

import { TOKENS } from '../../../api/tokens';
import { ControllerTest } from '../../../common/controller-test';
import { createGetMemberResult } from '../use-cases/get-member/get-member-result';

import { router } from './members.api';

describe('members api', () => {
  let test: ControllerTest;

  beforeEach(async () => {
    test = new ControllerTest(router);
    await test.init();
  });

  afterEach(() => test?.cleanup());

  it('retrieves the list of members', async () => {
    test.overrideQueryHandler(TOKENS.listMembersHandler, () => {
      return [createGetMemberResult({ id: 'memberId' })];
    });

    const response = await test.fetch('/');

    expect(await response.json()).toEqual([expect.objectContaining({ id: 'memberId' })]);
  });

  it('retrieves the subset of members matching a search query', async () => {
    const handle = vi.fn().mockResolvedValue([]);

    test.overrideQueryHandler(TOKENS.listMembersHandler, handle);

    await test.fetch('/?search=toto');

    expect(handle).toHaveBeenCalledWith({ search: 'toto' });
  });

  it('retrieves a single member', async () => {
    test.overrideQueryHandler(TOKENS.getMemberHandler, () => {
      return createGetMemberResult({ id: 'memberId' });
    });

    const response = await test.fetch('/memberId');

    expect(await response.json()).toEqual(expect.objectContaining({ id: 'memberId' }));
  });

  it('returns a 404 status code when the member does not exist', async () => {
    const response = await test.fetch('/memberId');

    expect(response.status).toEqual(404);
  });
});

import { TOKENS } from '../../api/tokens';
import { ControllerTest } from '../../common/controller-test';
import { createGetMemberResult } from '../members/use-cases/get-member/get-member-result';

import { router } from './authentication.controller';

describe('authentication controller', () => {
  let test: ControllerTest;

  beforeEach(async () => {
    test = new ControllerTest(router);
    await test.init();
  });

  afterEach(() => test?.cleanup());

  it('creates a new session and retrieves the associated member', async () => {
    await test.agent.post('/login', {
      memberId: 'memberId',
    });

    test.overrideQueryHandler(TOKENS.getMemberHandler, () =>
      createGetMemberResult({
        id: 'memberId',
      })
    );

    const response = await test.agent.get('/me');

    expect(response.status).toEqual(200);
    expect(await response.json()).toHaveProperty('id', 'memberId');
  });

  it('fails when no member is associated to the token', async () => {
    test.logError = false;

    await test.agent.post('/login', {
      memberId: 'memberId',
    });

    const response = await test.agent.get('/me');

    expect(response.status).toEqual(500);
    expect(await response.text()).toEqual('no member associated to this session token');
  });
});

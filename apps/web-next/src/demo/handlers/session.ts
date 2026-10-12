import { requestAuthenticationCodeQuerySchema } from '@sel/shared';

import { demo } from '../demo';

export const demoSessionRoutes = [
  // The seed's logo is in the public directory, served under the base url.
  demo.route('GET', '/config', ({ state }) => {
    return demo.json({ ...state.config, logoUrl: import.meta.env.BASE_URL + state.config.logoUrl });
  }),

  demo.route('POST', '/authentication/request-authentication-code', ({ state, query }) => {
    const { email } = requestAuthenticationCodeQuerySchema.parse(query);

    state.authenticationMemberId = state.members.find((member) => member.email === email)?.id;

    return demo.noContent();
  }),

  demo.route('GET', '/authentication/verify-authentication-code', ({ state }) => {
    if (state.authenticationMemberId === undefined) {
      throw new demo.Error(404, 'Authentication code not found', 'AuthenticationCodeNotFound');
    }

    state.sessionMemberId = state.authenticationMemberId;
    state.authenticationMemberId = undefined;

    return demo.noContent();
  }),

  demo.route('GET', '/session/member', ({ member }) => demo.json(member())),

  demo.route('DELETE', '/session', ({ state }) => {
    state.sessionMemberId = undefined;

    return demo.noContent();
  }),
];

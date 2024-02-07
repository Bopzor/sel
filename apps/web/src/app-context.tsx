import { AuthenticatedMember } from '@sel/shared';
import { defined } from '@sel/utils';
import { JSX, createContext, createResource, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';

import { container } from './infrastructure/container';
import { TOKENS } from './tokens';

type AppContext = {
  authenticatedMember: AuthenticatedMember | undefined;
};

const appContext = createContext<AppContext>();

export function AppContextProvider(props: { children: JSX.Element }) {
  const sessionApi = container.resolve(TOKENS.sessionApi);

  const [authenticatedMember] = createResource(() => sessionApi.getAuthenticatedMember());

  const [context] = createStore<AppContext>({
    get authenticatedMember() {
      return authenticatedMember();
    },
  });

  return <appContext.Provider value={context}>{props.children}</appContext.Provider>;
}

export function getAppContext() {
  return defined(useContext(appContext), 'Missing AppContextProvider');
}

export function authenticatedMember() {
  return getAppContext().authenticatedMember;
}

export const isAuthenticatedMember = (member: { id: string }) => {
  return member.id === authenticatedMember()?.id;
};

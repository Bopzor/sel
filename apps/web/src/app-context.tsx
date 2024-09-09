import { AuthenticatedMember } from '@sel/shared';
import { defined } from '@sel/utils';
import { JSX, createContext, createResource, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';

import { container } from './infrastructure/container';
import { useSearchParam } from './infrastructure/router/use-search-param';
import { TOKENS } from './tokens';

type AppState = {
  authenticatedMember: AuthenticatedMember | undefined;
};

type AppActions = {
  refreshAuthenticatedMember: () => void;
};

type AppContext = [AppState, AppActions];

const appContext = createContext<AppContext>();

export function AppContextProvider(props: { children: JSX.Element }) {
  const sessionApi = container.resolve(TOKENS.sessionApi);

  const [token] = useSearchParam('auth-token');

  const [authenticatedMember, { refetch: refetchAuthenticatedMember }] = createResource(
    () => !token(),
    async () => sessionApi.getAuthenticatedMember(),
  );

  const [state] = createStore<AppState>({
    get authenticatedMember() {
      return authenticatedMember.latest;
    },
  });

  const actions: AppActions = {
    refreshAuthenticatedMember: () => void refetchAuthenticatedMember(),
  };

  return <appContext.Provider value={[state, actions]}>{props.children}</appContext.Provider>;
}

function getAppContext() {
  return defined(useContext(appContext), 'Missing AppContextProvider');
}

function getAppState() {
  return getAppContext()[0];
}

export function getAppActions() {
  return getAppContext()[1];
}

export function authenticatedMember() {
  return getAppState().authenticatedMember;
}

export function isAuthenticatedMember(member: { id: string }) {
  return member.id === authenticatedMember()?.id;
}

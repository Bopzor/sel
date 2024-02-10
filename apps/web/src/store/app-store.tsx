import { AuthenticatedMember, UpdateMemberProfileData } from '@sel/shared';
import { defined } from '@sel/utils';
import { JSX, createContext, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';

import { authenticatedMember } from '../app-context';
import { container } from '../infrastructure/container';
import { useTranslation } from '../intl/translate';
import { TOKENS } from '../tokens';
import { notify } from '../utils/notify';

type AppState = {
  authenticatedMember: AuthenticatedMember | undefined;
  authenticationLinkRequested: boolean;
};

function createAppStore() {
  const [state] = createStore<AppState>({
    get authenticatedMember() {
      return authenticatedMember();
    },
    authenticationLinkRequested: false,
  });

  const { ...authenticatedMemberActions } = authenticatedMemberState(state);

  return [
    state,
    {
      ...authenticatedMemberActions,
    },
  ] satisfies [unknown, unknown];
}

const appContext = createContext<ReturnType<typeof createAppStore>>();

export function AppStoreProvider(props: { children: JSX.Element }) {
  return <appContext.Provider value={createAppStore()}>{props.children}</appContext.Provider>;
}

function useAppStore() {
  return defined(useContext(appContext), 'Missing AppStoreProvider');
}

export function getAppState() {
  return useAppStore()[0];
}

export function getAppActions() {
  return useAppStore()[1];
}

function authenticatedMemberState(state: AppState) {
  const fetcher = container.resolve(TOKENS.fetcher);
  const translate = useTranslation();

  return {
    updateMemberProfile: async (data: UpdateMemberProfileData) => {
      await fetcher.put(`/api/members/${state.authenticatedMember?.id}/profile`, data);
      // await refetchMember();
      notify.success(translate('profile.profile.saved'));
    },
  };
}

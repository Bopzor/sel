import { AuthenticatedMember, Notification, UpdateMemberProfileData } from '@sel/shared';
import { defined } from '@sel/utils';
import { JSX, createContext, createResource, useContext } from 'solid-js';
import { SetStoreFunction, createStore } from 'solid-js/store';

import { authenticatedMember } from '../app-context';
import { container } from '../infrastructure/container';
import { useTranslation } from '../intl/translate';
import { routes } from '../routes';
import { TOKENS } from '../tokens';
import { notify } from '../utils/notify';

type AppState = {
  authenticatedMember: AuthenticatedMember | undefined;
  authenticationLinkRequested: boolean;
  notifications: Notification[] | undefined;
  unreadNotificationsCount: number | undefined;
};

type SetAppState = SetStoreFunction<AppState>;

function createAppStore() {
  const [state, setState] = createStore<AppState>({
    get authenticatedMember() {
      return authenticatedMember();
    },
    authenticationLinkRequested: false,
    get notifications() {
      return notifications();
    },
    unreadNotificationsCount: undefined,
  });

  const { notifications, ...authenticatedMemberActions } = authenticatedMemberState(state, setState);

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

function authenticatedMemberState(state: AppState, setState: SetAppState) {
  const fetcher = container.resolve(TOKENS.fetcher);
  const router = container.resolve(TOKENS.router);
  const translate = useTranslation();

  const [notifications, { refetch: refetchNotifications }] = createResource(authenticatedMember, async () => {
    const response = await fetcher.get<Notification[]>('/api/session/notifications');
    const count = response.headers.get('X-Unread-Notifications-Count');

    if (count) {
      setState('unreadNotificationsCount', Number(count));
    }

    return response.body;
  });

  return {
    notifications,

    signOut: async () => {
      await fetcher.delete('/api/session');
      // await refetchMember();
      router.navigate(routes.home);
    },

    updateMemberProfile: async (data: UpdateMemberProfileData) => {
      await fetcher.put(`/api/members/${state.authenticatedMember?.id}/profile`, data);
      // await refetchMember();
      notify.success(translate('profile.profile.saved'));
    },

    markNotificationAsRead: async (notificationId: string) => {
      await fetcher.put(`/api/session/notifications/${notificationId}/read`);
      await refetchNotifications();
    },
  };
}

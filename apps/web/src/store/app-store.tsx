import { AuthenticatedMember, Member, MembersSort, Notification, UpdateMemberProfileData } from '@sel/shared';
import { defined, isEnumValue } from '@sel/utils';
import { JSX, createContext, createEffect, createResource, createSignal, useContext } from 'solid-js';
import { SetStoreFunction, createStore } from 'solid-js/store';

import { FetchError } from '../fetcher';
import { container } from '../infrastructure/container';
import { useSearchParam } from '../infrastructure/router/use-search-param';
import { useTranslation } from '../intl/translate';
import { routes } from '../routes';
import { TOKENS } from '../tokens';
import { detectDevice } from '../utils/detect-device';
import { notify } from '../utils/notify';

const none = Symbol('none');
type None = typeof none;

type AppState = {
  authenticatedMember: AuthenticatedMember | undefined;
  authenticationLinkRequested: boolean;
  verifyAuthenticationTokenResult: undefined;
  loadingMembers: boolean;
  members: Member[] | undefined;
  notifications: Notification[] | undefined;
  unreadNotificationsCount: number | undefined;
  member: Member | undefined;
};

type SetAppState = SetStoreFunction<AppState>;

function createAppStore() {
  const [state, setState] = createStore<AppState>({
    get authenticatedMember() {
      return authenticatedMember();
    },
    authenticationLinkRequested: false,
    get verifyAuthenticationTokenResult() {
      return verifyAuthenticationTokenResult();
    },
    get loadingMembers() {
      return loadingMembers();
    },
    get members() {
      return members();
    },
    get notifications() {
      return notifications();
    },
    unreadNotificationsCount: undefined,
    get member() {
      return member();
    },
  });

  const {
    authenticatedMember,
    verifyAuthenticationTokenResult,
    notifications,
    ...authenticatedMemberActions
  } = authenticatedMemberState(state, setState);

  const { members, loadingMembers, member, ...membersActions } = membersState();

  return [
    state,
    {
      ...authenticatedMemberActions,
      ...membersActions,
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

export type AppSelector<Result> = (state: AppState) => Result;

export function select<Result>(selector: AppSelector<Result>) {
  const state = getAppState();

  return () => {
    return selector(state);
  };
}

function authenticatedMemberState(state: AppState, setState: SetAppState) {
  const fetcher = container.resolve(TOKENS.fetcher);
  const router = container.resolve(TOKENS.router);
  const translate = useTranslation();

  const [getToken, setToken] = useSearchParam('auth-token');

  const [authenticatedMember, { refetch: refetchMember }] = createResource(
    () => !getToken(),
    async () => {
      try {
        return await fetcher.get<AuthenticatedMember | undefined>('/api/session/member').body();
      } catch (error) {
        if (FetchError.is(error, 401)) {
          return undefined;
        } else {
          throw error;
        }
      }
    }
  );

  async function registerDeviceSubscription() {
    if (!navigator.serviceWorker) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY,
      });
    }

    await fetcher.post('/api/session/notifications/register-device', {
      deviceType: detectDevice(),
      subscription,
    });
  }

  createEffect(() => {
    if (authenticatedMember()) {
      // eslint-disable-next-line no-console
      void registerDeviceSubscription().catch(console.error);
    }
  });

  const [verifyAuthenticationTokenResult] = createResource(getToken, async (token) => {
    const params = new URLSearchParams({ token });

    try {
      await fetcher.get(`/api/authentication/verify-authentication-token?${params}`);
      await refetchMember();

      // required to trigger suspense
      return undefined;
    } catch (error) {
      if (!FetchError.is(error)) {
        throw error;
      }

      if (error.body.code === 'TokenNotFound') {
        notify.error(translate('authentication.invalidAuthenticationLink'));
      } else if (error.body.code === 'TokenExpired') {
        notify.error(translate('authentication.authenticationLinkExpired'));
      } else {
        throw error;
      }
    } finally {
      setToken(undefined);
    }
  });

  const [notifications, { refetch: refetchNotifications }] = createResource(authenticatedMember, async () => {
    const response = await fetcher.get<Notification[]>('/api/session/notifications');
    const count = response.headers.get('X-Unread-Notifications-Count');

    if (count) {
      setState('unreadNotificationsCount', Number(count));
    }

    return response.body;
  });

  return {
    authenticatedMember: () => authenticatedMember.latest,
    verifyAuthenticationTokenResult,
    notifications,

    requestAuthenticationLink: async (email: string) => {
      setState('authenticationLinkRequested', true);

      try {
        const params = new URLSearchParams({ email });
        await fetcher.post(`/api/authentication/request-authentication-link?${params}`);
      } catch (error) {
        setState('authenticationLinkRequested', false);
        throw error;
      }
    },

    signOut: async () => {
      await fetcher.delete('/api/session');
      await refetchMember();
      router.navigate(routes.home);
    },

    updateMemberProfile: async (data: UpdateMemberProfileData) => {
      await fetcher.put(`/api/members/${state.authenticatedMember?.id}/profile`, data);
      await refetchMember();
      notify.success(translate('profile.profile.saved'));
    },

    markNotificationAsRead: async (notificationId: string) => {
      await fetcher.put(`/api/session/notifications/${notificationId}/read`);
      await refetchNotifications();
    },
  };
}

export const selectAuthenticatedMember = (state: AppState) => {
  return state.authenticatedMember;
};

function membersState() {
  const fetcher = container.resolve(TOKENS.fetcher);

  const [membersSort, setMembersSort] = createSignal<MembersSort | None>();

  const [members] = createResource(membersSort, async (sort) => {
    let endpoint = '/api/members';
    const search = new URLSearchParams();

    if (isEnumValue(MembersSort)(sort)) {
      search.set('sort', sort);
    }

    if (search.size > 0) {
      endpoint += `?${search}`;
    }

    return fetcher.get<Member[]>(endpoint).body();
  });

  const [memberId, setMemberId] = createSignal<string>();

  const [member, { mutate: setMember }] = createResource(memberId, async (memberId) => {
    return fetcher.get<Member>(`/api/members/${memberId}`).body();
  });

  return {
    loadingMembers: () => members.loading,
    members: () => members.latest,
    member,

    loadMembers: (sort: MembersSort | undefined) => {
      setMembersSort(sort ?? none);
    },

    loadMember: (memberId: string | undefined) => {
      setMemberId(memberId);

      if (!memberId) {
        setMember(undefined);
      }
    },
  };
}

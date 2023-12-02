import { AuthenticatedMember, Member, MembersSort, UpdateMemberProfileData } from '@sel/shared';
import { defined, isEnumValue } from '@sel/utils';
import { JSX, createContext, createResource, createSignal, useContext } from 'solid-js';
import { SetStoreFunction, createStore } from 'solid-js/store';

import { FetchError } from '../fetcher';
import { container } from '../infrastructure/container';
import { useSearchParam } from '../infrastructure/router/use-search-param';
import { useTranslation } from '../intl/translate';
import { routes } from '../routes';
import { TOKENS } from '../tokens';
import { notify } from '../utils/notify';

const none = Symbol('none');
type None = typeof none;

type AppState = {
  authenticatedMember: AuthenticatedMember | undefined;
  authenticationLinkRequested: boolean;
  verifyAuthenticationTokenResult: undefined;
  loadingMembers: boolean;
  members: Member[] | undefined;
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
    get member() {
      return member();
    },
  });

  const { authenticatedMember, verifyAuthenticationTokenResult, ...authenticatedMemberActions } =
    authenticatedMemberState(state, setState);

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

export function getMutations() {
  return useAppStore()[1];
}

function authenticatedMemberState(state: AppState, setState: SetAppState) {
  const fetcher = container.resolve(TOKENS.fetcher);
  const router = container.resolve(TOKENS.router);
  const translate = useTranslation();

  const [getToken, setToken] = useSearchParam('auth-token');

  const [authenticatedMember, { refetch }] = createResource(
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

  const [verifyAuthenticationTokenResult] = createResource(getToken, async (token) => {
    const params = new URLSearchParams({ token });

    try {
      await fetcher.get(`/api/authentication/verify-authentication-token?${params}`);
      await refetch();
      return undefined;
    } finally {
      setToken(undefined);
    }
  });

  return {
    authenticatedMember: () => authenticatedMember.latest,
    verifyAuthenticationTokenResult,

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
      await refetch();
      router.navigate(routes.home);
    },

    updateMemberProfile: async (data: UpdateMemberProfileData) => {
      await fetcher.put(`/api/members/${state.authenticatedMember?.id}/profile`, data);
      await refetch();
      notify.success(translate('profile.profile.saved'));
    },
  };
}

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

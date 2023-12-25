import { AuthenticatedMember, Member, MembersSort, Request, UpdateMemberProfileData } from '@sel/shared';
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
  requests: Request[] | undefined;
  request: Request | undefined;
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
    get requests() {
      return requests();
    },
    get request() {
      return request();
    },
  });

  const { authenticatedMember, verifyAuthenticationTokenResult, ...authenticatedMemberActions } =
    authenticatedMemberState(state, setState);

  const { members, loadingMembers, member, ...membersActions } = membersState();

  const { requests, request, ...requestsActions } = requestsState();

  return [
    state,
    {
      ...authenticatedMemberActions,
      ...membersActions,
      ...requestsActions,
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

function requestsState() {
  const fetcher = container.resolve(TOKENS.fetcher);
  const router = container.resolve(TOKENS.router);
  const translate = useTranslation();

  const [loadRequests, setLoadRequests] = createSignal<boolean>();

  const [requests, { refetch: refetchRequestsList }] = createResource(
    loadRequests,
    async (): Promise<Request[]> => {
      return fetcher.get<Request[]>('/api/requests').body();
    }
  );

  const [requestId, setRequestId] = createSignal<string>();

  const [request, { refetch: refetchRequest }] = createResource(
    requestId,
    async (requestId): Promise<Request> => {
      return fetcher.get<Request>(`/api/requests/${requestId}`).body();
    }
  );

  return {
    requests,
    request,

    loadRequests: () => {
      setLoadRequests(true);
    },

    loadRequest: (requestId: string) => {
      setRequestId(requestId);
    },

    createRequest: async (title: string, body: string) => {
      const requestId = await fetcher
        .post<{ title: string; body: string }, string>('/api/requests', { title, body })
        .body();

      await refetchRequestsList();
      router.navigate(routes.requests.request(requestId));
      notify.success(translate('requests.create.created'));
    },

    createRequestComment: async (requestId: string, body: string) => {
      await fetcher.post<{ body: string }, string>(`/api/requests/${requestId}/comment`, { body }).body();

      await refetchRequest();
      notify.success(translate('requests.comments.created'));
    },
  };
}

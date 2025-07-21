import { Navigate, Route, Router } from '@solidjs/router';
import { QueryClientProvider } from '@tanstack/solid-query';
import { JSX } from 'solid-js';
import { Toaster } from 'solid-toast';

import { MatomoProvider } from './application/matomo';
import { apiQuery } from './application/query';
import { queryClient } from './application/query-client';
import { routes } from './application/routes';
import { breadcrumbs } from './components/breadcrumb';
import { NotFound, RootErrorBoundary } from './components/error-boundary';
import { IntlProvider } from './intl/intl-provider';
import { Layout } from './layout';
import { AdminMemberListPage } from './pages/admin/member-list.page';
import { AuthenticationLayout } from './pages/authentication/authentication.layout';
import { AuthenticationPage } from './pages/authentication/authentication.page';
import { CreateEventPage } from './pages/events/create/create-event.page';
import { EventDetailsPage } from './pages/events/details/event-details.page';
import { EditEventPage } from './pages/events/edit/edit-event.page';
import { EventListPage } from './pages/events/list/event-list.page';
import { preloadEvent, preloadEventList } from './pages/events/preload';
import { Home } from './pages/home/home.page';
import { preloadInformationList } from './pages/home/preload';
import { InformationDetailsPage } from './pages/information/information-details.page';
import { preloadInformation } from './pages/information/preload';
import { InterestsPage } from './pages/interests/interests.page';
import { preloadInterestList } from './pages/interests/preload';
import { MemberDetailsPage } from './pages/members/member-details/member-details.page';
import { MemberListPage } from './pages/members/members-list/member-list.page';
import { preloadMember, preloadMemberList } from './pages/members/preload';
import { MiscPage } from './pages/misc/misc.page';
import { OnboardingLayout } from './pages/onboarding/onboarding.layout';
import { OnboardingPage } from './pages/onboarding/onboarding.page';
import { AddressPage } from './pages/profile/address/address.page';
import { ProfileEditionPage } from './pages/profile/edition/profile-edition.page';
import { preloadTransactionList } from './pages/profile/preload';
import { ProfileLayout } from './pages/profile/profile.layout';
import { SettingsPage } from './pages/profile/setting/settings.page';
import { SignOutPage } from './pages/profile/sign-out/sign-out.page';
import { TransactionsPage } from './pages/profile/transactions/transactions.page';
import { CreateRequestPage } from './pages/requests/create/create-request.page';
import { RequestDetailsPage } from './pages/requests/details/request-details.page';
import { EditRequestPage } from './pages/requests/edit/edit-request.page';
import { RequestListPage } from './pages/requests/list/request-list.page';
import { preloadRequest, preloadRequestList } from './pages/requests/preload';

function rootPreload() {
  void queryClient.prefetchQuery(apiQuery('getConfig', {}));
  void queryClient.prefetchQuery(apiQuery('getAuthenticatedMember', {}));
}

export function App() {
  const info = (route: keyof typeof breadcrumbs) => {
    return { breadcrumb: route };
  };

  return (
    <Router root={Providers} rootPreload={rootPreload}>
      <Route path="/authentication" component={AuthenticationLayout}>
        <Route path="/" component={AuthenticationPage} />
      </Route>

      <Route path="/onboarding" component={OnboardingLayout}>
        <Route path="/" component={OnboardingPage} />
      </Route>

      <Route component={Layout} info={info('home')}>
        <Route path="/" component={Home} preload={preloadInformationList} />

        <Route
          path="/information/:informationId"
          component={InformationDetailsPage}
          preload={preloadInformation}
          info={info('information')}
        />

        <Route path="/members" info={info('members')}>
          <Route path="/" component={MemberListPage} preload={preloadMemberList} />
          <Route
            path="/:memberId"
            component={MemberDetailsPage}
            preload={preloadMember}
            info={info('member')}
          />
        </Route>

        <Route path="/requests" info={info('requests')}>
          <Route path="/" component={RequestListPage} preload={preloadRequestList} />
          <Route path="/create" component={CreateRequestPage} info={info('createRequest')} />
          <Route
            path="/:requestId"
            component={RequestDetailsPage}
            preload={preloadRequest}
            info={info('request')}
          />
          <Route
            path="/:requestId/edit"
            component={EditRequestPage}
            preload={preloadRequest}
            info={info('editRequest')}
          />
        </Route>

        <Route path="/events" info={info('events')}>
          <Route path="/" component={EventListPage} preload={preloadEventList} />
          <Route path="/create" component={CreateEventPage} info={info('createEvent')} />
          <Route path="/:eventId" component={EventDetailsPage} preload={preloadEvent} info={info('event')} />
          <Route
            path="/:eventId/edit"
            component={EditEventPage}
            preload={preloadEvent}
            info={info('editEvent')}
          />
        </Route>

        <Route path="/interests" info={info('interests')}>
          <Route path="/" component={InterestsPage} preload={preloadInterestList} />
        </Route>

        <Route path="/profile" component={ProfileLayout} info={info('profile')}>
          <Route path="/" component={ProfileEditionPage} />
          <Route path="/address" component={AddressPage} />
          <Route path="/transactions" component={TransactionsPage} preload={preloadTransactionList} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/sign-out" component={SignOutPage} />
        </Route>

        <Route path="/misc">
          <Route path="/" component={MiscPage} />
        </Route>

        <Route path="/admin" info={info('admin')}>
          <Route path="/" component={() => <Navigate href={routes.admin.memberList} />} />
          <Route path="/members" component={AdminMemberListPage} info={info('adminMembers')} />
        </Route>

        <Route path="*" component={PageNotFound} />
      </Route>
    </Router>
  );
}

function Providers(props: { children?: JSX.Element }) {
  return (
    <RootErrorBoundary>
      <IntlProvider>
        <MatomoProvider>
          <QueryClientProvider client={queryClient}>
            <Toaster toastOptions={{ duration: 5 * 1000, className: 'max-w-xl!' }} />
            {props.children}
          </QueryClientProvider>
        </MatomoProvider>
      </IntlProvider>
    </RootErrorBoundary>
  );
}

function PageNotFound() {
  return (
    <div class="mx-auto my-32 col items-center justify-center gap-6 px-4">
      <NotFound />
    </div>
  );
}

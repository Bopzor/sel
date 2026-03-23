import { Navigate, Route, Router } from '@solidjs/router';
import { QueryClientProvider } from '@tanstack/solid-query';
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools';
import { JSX } from 'solid-js';
import { Toaster } from 'solid-toast';

import { MatomoProvider } from './application/matomo';
import { apiQuery } from './application/query';
import { queryClient } from './application/query-client';
import { routes } from './application/routes';
import { breadcrumbs } from './components/breadcrumb';
import { ErrorBoundary, NotFound } from './components/error-boundary';
import { IntlProvider } from './intl/intl-provider';
import { Layout } from './layout';
import { AdminMemberDetailsPage } from './pages/admin/member-details.page';
import { AdminMemberListPage } from './pages/admin/member-list.page';
import { AuthenticationLayout } from './pages/authentication/authentication.layout';
import { AuthenticationPage } from './pages/authentication/authentication.page';
import { DocumentsPage } from './pages/documents/documents.page';
import { CreateEventPage } from './pages/events/create/create-event.page';
import { EventDetailsPage } from './pages/events/details/event-details.page';
import { EditEventPage } from './pages/events/edit/edit-event.page';
import { EventListPage } from './pages/events/list/event-list.page';
import { preloadEvent, preloadEventList } from './pages/events/preload';
import { Home } from './pages/home/home.page';
import { preloadHome } from './pages/home/preload';
import { CreateInformationPage } from './pages/information/create/create-information.page';
import { InformationDetailsPage } from './pages/information/detail/information-details.page';
import { EditInformationPage } from './pages/information/edit/edit-information.page';
import { preloadInformation } from './pages/information/preload';
import { InterestsPage } from './pages/interests/interests.page';
import { preloadInterestList } from './pages/interests/preload';
import { LandingPage } from './pages/landing/landing.page';
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

function mainPreload() {
  void queryClient.prefetchQuery(apiQuery('getConfig', {}));
  void queryClient.prefetchQuery(apiQuery('getAuthenticatedMember', {}));
}

export function App() {
  return (
    <Router root={Providers}>
      <Route path="/" component={LandingPage} />

      <Route path="/authentication" component={AuthenticationLayout}>
        <Route path="/" component={AuthenticationPage} />
      </Route>

      <Route path="/onboarding" component={OnboardingLayout}>
        <Route path="/" component={OnboardingPage} />
      </Route>

      <Route component={Layout} preload={mainPreload} info={{ breadcrumb: breadcrumbs.home }}>
        <Route path="/home" component={Home} preload={preloadHome} />

        <Route path="/information">
          <Route
            path="/create"
            component={CreateInformationPage}
            info={{ breadcrumb: breadcrumbs.createInformation }}
          />
          <Route
            path="/:informationId"
            preload={preloadInformation}
            info={{ breadcrumb: breadcrumbs.information }}
          >
            <Route component={InformationDetailsPage} />
            <Route
              path="edit"
              component={EditInformationPage}
              preload={preloadInformation}
              info={{ breadcrumb: breadcrumbs.editInformation }}
            />
          </Route>
        </Route>

        <Route path="/members" info={{ breadcrumb: breadcrumbs.members }}>
          <Route path="/" component={MemberListPage} preload={preloadMemberList} />
          <Route
            path="/:memberId"
            component={MemberDetailsPage}
            preload={preloadMember}
            info={{ breadcrumb: breadcrumbs.member }}
          />
        </Route>

        <Route path="/requests" info={{ breadcrumb: breadcrumbs.requests }}>
          <Route path="/" component={RequestListPage} preload={preloadRequestList} />
          <Route
            path="/create"
            component={CreateRequestPage}
            info={{ breadcrumb: breadcrumbs.createRequest }}
          />
          <Route path="/:requestId" preload={preloadRequest} info={{ breadcrumb: breadcrumbs.request }}>
            <Route component={RequestDetailsPage} />
            <Route
              path="/edit"
              component={EditRequestPage}
              preload={preloadRequest}
              info={{ breadcrumb: breadcrumbs.editRequest }}
            />
          </Route>
        </Route>

        <Route path="/events" info={{ breadcrumb: breadcrumbs.events }}>
          <Route path="/" component={EventListPage} preload={preloadEventList} />
          <Route path="/create" component={CreateEventPage} info={{ breadcrumb: breadcrumbs.createEvent }} />
          <Route path="/:eventId" preload={preloadEvent} info={{ breadcrumb: breadcrumbs.event }}>
            <Route component={EventDetailsPage} />
            <Route
              path="/edit"
              component={EditEventPage}
              preload={preloadEvent}
              info={{ breadcrumb: breadcrumbs.editEvent }}
            />
          </Route>
        </Route>

        <Route path="/interests" info={{ breadcrumb: breadcrumbs.interests }}>
          <Route path="/" component={InterestsPage} preload={preloadInterestList} />
        </Route>

        <Route path="/profile" component={ProfileLayout} info={{ breadcrumb: breadcrumbs.profile }}>
          <Route path="/" component={ProfileEditionPage} />
          <Route path="/address" component={AddressPage} info={{ breadcrumb: breadcrumbs.profileAddress }} />
          <Route
            path="/transactions"
            component={TransactionsPage}
            preload={preloadTransactionList}
            info={{ breadcrumb: breadcrumbs.profileTransactions }}
          />
          <Route
            path="/settings"
            component={SettingsPage}
            info={{ breadcrumb: breadcrumbs.profileSettings }}
          />
          <Route path="/sign-out" component={SignOutPage} info={{ breadcrumb: breadcrumbs.profileSignOut }} />
        </Route>

        <Route path="/documents">
          <Route path="/" component={DocumentsPage} />
        </Route>

        <Route path="/misc">
          <Route path="/" component={MiscPage} />
        </Route>

        <Route path="/admin" info={{ breadcrumb: breadcrumbs.admin }}>
          <Route path="/" component={() => <Navigate href={routes.admin.memberList} />} />
          <Route path="/members" info={{ breadcrumb: breadcrumbs.adminMembers }}>
            <Route component={AdminMemberListPage} />
            <Route
              path="/:memberId"
              component={AdminMemberDetailsPage}
              info={{ breadcrumb: breadcrumbs.adminMember }}
            />
          </Route>
        </Route>

        <Route path="*" component={PageNotFound} />
      </Route>
    </Router>
  );
}

function Providers(props: { children?: JSX.Element }) {
  return (
    <IntlProvider>
      <ErrorBoundary>
        <MatomoProvider>
          <QueryClientProvider client={queryClient}>
            <SolidQueryDevtools initialIsOpen={false} />
            <Toaster toastOptions={{ duration: 5 * 1000, className: 'max-w-xl!' }} />
            {props.children}
          </QueryClientProvider>
        </MatomoProvider>
      </ErrorBoundary>
    </IntlProvider>
  );
}

function PageNotFound() {
  return (
    <div class="mx-auto my-32 col items-center justify-center gap-6 px-4">
      <NotFound />
    </div>
  );
}

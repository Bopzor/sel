/* @refresh reload */

import 'solid-devtools';

import { Navigate, Route, Router } from '@solidjs/router';
import { lazy } from 'solid-js';
import { render } from 'solid-js/web';

import '@fontsource-variable/inter';

import { App } from './app';
import { BackLink } from './components/back-link';
import { Translate } from './intl/translate';
import { routes } from './routes';

import './index.css';

Error.stackTraceLimit = 1 << 8;

const HomePage = lazy(() => import('./modules/home/home.page'));
const OnboardingPage = lazy(() => import('./modules/onboarding/onboarding.page'));

const MembersListPage = lazy(() => import('./modules/members/members-list/members-list.page'));
const MemberDetailsPage = lazy(() => import('./modules/members/member-details/member-details.page'));

const RequestsListPage = lazy(() => import('./modules/requests/requests-list/requests-list.page'));
const CreateRequestPage = lazy(() => import('./modules/requests/create-request/create-request.page'));
const RequestDetailsPage = lazy(() => import('./modules/requests/request-details/request-details.page'));
const EditRequestPage = lazy(() => import('./modules/requests/edit-request/edit-request.page'));

const EventsListPage = lazy(() => import('./modules/events/events-list.page'));
const CreateEventPage = lazy(() => import('./modules/events/create-event/create-event.page'));
const EventDetailsPage = lazy(() => import('./modules/events/event-details/event-details.page'));
const EditEventPage = lazy(() => import('./modules/events/edit-event/edit-event.page'));

const InterestsPage = lazy(() => import('./modules/interests/interests.page'));

const MiscPage = lazy(() => import('./modules/misc/misc.page'));

const ProfileLayout = lazy(() => import('./modules/profile/profile.layout'));
const ProfileEditionPage = lazy(() => import('./modules/profile/profile-edition/profile-edition.page'));
const AddressPage = lazy(() => import('./modules/profile/address/address.page'));
const TransactionsPage = lazy(() => import('./modules/profile/transactions/transactions.page'));
const ProfileInterestsPage = lazy(() => import('./modules/profile/interests/profile-interests.page'));
const SettingsPage = lazy(() => import('./modules/profile/settings/settings.page'));
const SignOutPage = lazy(() => import('./modules/profile/sign-out/sign-out.page'));

const MemberListPage = lazy(() => import('./modules/admin/member-list.page'));

const ErrorTestPage = lazy(() => import('./utils/error-test.page'));

render(
  () => (
    <Router root={App}>
      <Routing />
    </Router>
  ),
  document.getElementById('root') as HTMLElement,
);

function Routing() {
  return (
    <>
      <Route path="/" component={HomePage} />

      <Route path="/onboarding" component={OnboardingPage} />

      <Route path="/members" component={MembersListPage} />
      <Route path="/members/:memberId" component={MemberDetailsPage} />

      <Route path="/requests" component={RequestsListPage} />
      <Route path="/requests/create" component={CreateRequestPage} />
      <Route path="/requests/:requestId" component={RequestDetailsPage} />
      <Route path="/requests/:requestId/edit" component={EditRequestPage} />

      <Route path="/events">
        <Route path="/" component={EventsListPage} />
        <Route path="/create" component={CreateEventPage} />
        <Route path="/:eventId" component={EventDetailsPage} />
        <Route path="/:eventId/edit" component={EditEventPage} />
      </Route>

      <Route path="/profile" component={ProfileLayout}>
        <Route path="/" component={ProfileEditionPage} />
        <Route path="/address" component={AddressPage} />
        <Route path="/transactions" component={TransactionsPage} />
        <Route path="/interests" component={ProfileInterestsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/sign-out" component={SignOutPage} />
      </Route>

      <Route path="/interests" component={InterestsPage} />

      <Route path="/assets" component={AssetsPage} />
      <Route path="/misc" component={MiscPage} />

      <Route path="/admin">
        <Route path="/members" component={MemberListPage} />
        <Route path="*" component={() => <Navigate href="/admin/members" />} />
      </Route>

      <Route path="/__error" component={ErrorTestPage} />

      {/* to do */}
      <Route path="*" component={() => <>Not found.</>} />
    </>
  );
}

export function AssetsPage() {
  return (
    <div>
      <BackLink href={routes.home} />

      <h1>
        <Translate id="assets.title" />
      </h1>

      <p class="font-semibold">
        <Translate id="assets.sentence1" />
      </p>

      <p>
        <Translate id="assets.sentence2" />
      </p>
    </div>
  );
}

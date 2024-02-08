/* @refresh reload */

import 'solid-devtools';

import { Route, Router } from '@solidjs/router';
import { lazy } from 'solid-js';
import { render } from 'solid-js/web';

import '@fontsource-variable/inter';

import { App } from './app';
import { BackLink } from './components/back-link';
import { Translate } from './intl/translate';
import { NotificationsPage } from './profile/notifications.page';
import { routes } from './routes';

import './index.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyImport(module: () => Promise<any>, name: string) {
  return lazy(() => module().then((module) => ({ default: module[name] })));
}

const HomePage = lazyImport(() => import('./home.page'), 'HomePage');
const OnboardingPage = lazyImport(() => import('./onboarding/onboarding.page'), 'OnboardingPage');
const MembersListPage = lazy(() => import('./modules/members/members-list/members-list.page'));
const MemberDetailsPage = lazy(() => import('./modules/members/member-details/member-details.page'));
const RequestsListPage = lazy(() => import('./modules/requests/requests-list/requests-list.page'));
const CreateRequestPage = lazy(() => import('./modules/requests/create-request/create-request.page'));
const RequestDetailsPage = lazy(() => import('./modules/requests/request-details/request-details.page'));
const EditRequestPage = lazy(() => import('./modules/requests/edit-request/edit-request.page'));
const MiscPage = lazyImport(() => import('./misc.page'), 'MiscPage');
const ProfileLayout = lazyImport(() => import('./profile/profile.layout'), 'ProfileLayout');
const ProfileEditionPage = lazyImport(() => import('./profile/profile-edition.page'), 'ProfileEditionPage');
const AddressPage = lazyImport(() => import('./profile/address.page'), 'AddressPage');
const SettingsPage = lazyImport(() => import('./profile/settings.page'), 'SettingsPage');
const SignOutPage = lazyImport(() => import('./profile/sign-out.page'), 'SignOutPage');
const ErrorTestPage = lazyImport(() => import('./utils/error-test.page'), 'TestErrorPage');

Error.stackTraceLimit = 1 << 8;

const root = document.getElementById('root');

render(
  () => (
    <Router root={App}>
      <Routing />
    </Router>
  ),
  root as HTMLElement
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

      <Route path="/profile" component={ProfileLayout}>
        <Route path="/" component={ProfileEditionPage} />
        <Route path="/address" component={AddressPage} />
        <Route path="/notifications" component={NotificationsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/sign-out" component={SignOutPage} />
      </Route>

      <Route path="/events" component={EventsPage} />
      <Route path="/activities" component={ActivitiesPage} />
      <Route path="/assets" component={AssetsPage} />
      <Route path="/misc" component={MiscPage} />

      <Route path="/__error" component={ErrorTestPage} />
    </>
  );
}

export function EventsPage() {
  return (
    <div>
      <BackLink href={routes.home} />

      <h1>
        <Translate id="events.title" />
      </h1>

      <p class="font-semibold">
        <Translate id="events.sentence1" />
      </p>

      <p>
        <Translate id="events.sentence2" />
      </p>
    </div>
  );
}

export function ActivitiesPage() {
  return (
    <div>
      <BackLink href={routes.home} />

      <h1>
        <Translate id="activities.title" />
      </h1>

      <p class="font-semibold">
        <Translate id="activities.sentence1" />
      </p>

      <p>
        <Translate id="activities.sentence2" />
      </p>
    </div>
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

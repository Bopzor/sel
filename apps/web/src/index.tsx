/* @refresh reload */

import 'solid-devtools';

import { Route, Router } from '@solidjs/router';
import { lazy } from 'solid-js';
import { render } from 'solid-js/web';

import '@fontsource-variable/inter/index.css';

import { App } from './app';
import { BackLink } from './components/back-link';
import { Feature, FeatureFlag } from './components/feature-flag';
import { Translate } from './intl/translate';
import { routes } from './routes';

import './index.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyImport(module: () => Promise<any>, name: string) {
  return lazy(() => module().then((module) => ({ default: module[name] })));
}

const HomePage = lazyImport(() => import('./home.page'), 'HomePage');
const OnboardingPage = lazyImport(() => import('./onboarding/onboarding.page'), 'OnboardingPage');
const MembersPage = lazyImport(() => import('./members/members.page'), 'MembersPage');
const MemberPage = lazyImport(() => import('./members/member.page'), 'MemberPage');
const RequestsPage = lazyImport(() => import('./requests/requests.page'), 'RequestsPage');
// prettier-ignore
const CreateRequestPage = lazyImport(() => import('./requests/create-request/create-request.page'), 'CreateRequestPage');
const RequestPage = lazyImport(() => import('./requests/request/request.page'), 'RequestPage');
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
      <Route path="/members" component={MembersPage} />
      <Route path="/members/:memberId" component={MemberPage} />

      <FeatureFlag
        feature={Feature.requests}
        fallback={<Route path="/requests" component={RequestsPlaceholderPage} />}
      >
        <Route path="/requests" component={RequestsPage} />
      </FeatureFlag>

      <Route path="/requests/create" component={CreateRequestPage} />
      <Route path="/requests/:requestId" component={RequestPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/activities" component={ActivitiesPage} />
      <Route path="/assets" component={AssetsPage} />
      <Route path="/misc" component={MiscPage} />
      <Route path="/profile" component={ProfileLayout}>
        <Route path="/" component={ProfileEditionPage} />
        <Route path="/address" component={AddressPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/sign-out" component={SignOutPage} />
      </Route>
      <Route path="/__error" component={ErrorTestPage} />
    </>
  );
}

function RequestsPlaceholderPage() {
  return (
    <div>
      <BackLink href={routes.home} />

      <h1>
        <Translate id="requests.title" />
      </h1>

      <p class="font-semibold">
        <Translate id="requests.sentence1" />
      </p>

      <p>
        <Translate id="requests.sentence2" />
      </p>
    </div>
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

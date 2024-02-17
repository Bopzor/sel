import { Match, Switch as SolidSwitch, createResource } from 'solid-js';

import { Button } from '../../../components/button';
import { Feature, hasFeatureFlag, setFeatureFlag } from '../../../components/feature-flag';
import { Switch } from '../../../components/switch';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { TOKENS } from '../../../tokens';
import { createAsyncCall } from '../../../utils/create-async-call';

const T = Translate.prefix('profile.settings');

const TranslateFeatureFlag = Translate.enum('profile.settings.featureFlags');

export default function SettingsPage() {
  const isDarkMode = () => localStorage.getItem('dark') === 'true';

  const toggleDarkMode = () => {
    localStorage.setItem('dark', String(!isDarkMode()));

    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(isDarkMode() ? 'dark' : 'light');
  };

  const hasEventsFlag = hasFeatureFlag(Feature.events);

  const toggleEventsFlag = () => {
    setFeatureFlag(Feature.events, !hasEventsFlag());
  };

  return (
    <>
      <h1>
        <T id="title" />
      </h1>

      <p>
        <Switch checked={isDarkMode()} onChange={() => toggleDarkMode()}>
          <T id="darkMode" />
        </Switch>
      </p>

      <p>
        <Switch checked={hasEventsFlag()} onChange={() => toggleEventsFlag()}>
          <TranslateFeatureFlag value={Feature.events} />
        </Switch>
      </p>

      <NotificationSettings />
    </>
  );
}

function NotificationSettings() {
  const push = container.resolve(TOKENS.pushSubscription);
  const [registration, { refetch }] = createResource(() => push.getRegistrationState());

  const [registerDevice] = createAsyncCall(() => push.registerDevice(), {
    onSettled() {
      void refetch();
    },
  });

  return (
    <>
      <h2>
        <T id="notificationSettings" />
      </h2>

      <SolidSwitch>
        <Match when={registration() === 'prompt'}>
          <p>
            <T id="deviceNotRegistered" />
          </p>
          <Button onClick={registerDevice} class="self-start">
            <T id="registerDevice" />
          </Button>
        </Match>

        <Match when={registration() === 'granted'}>
          <T id="deviceRegistered" />
        </Match>

        <Match when={registration() === 'denied'}>
          <T id="notificationPermissionDenied" />
        </Match>
      </SolidSwitch>
    </>
  );
}

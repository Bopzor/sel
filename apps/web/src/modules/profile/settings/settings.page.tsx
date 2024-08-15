import { Switch } from '../../../components/switch';
import { Translate } from '../../../intl/translate';

import { NotificationSettings } from './notification-settings';

const T = Translate.prefix('profile.settings');

export default function SettingsPage() {
  return (
    <div class="col gap-6">
      <h1>
        <T id="title" />
      </h1>

      <NotificationSettings />
      <UISettings />
    </div>
  );
}

function UISettings() {
  const isDarkMode = () => localStorage.getItem('dark') === 'true';

  const toggleDarkMode = () => {
    localStorage.setItem('dark', String(!isDarkMode()));

    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(isDarkMode() ? 'dark' : 'light');
  };

  return (
    <div class="card col gap-4 p-4">
      <h2>
        <T id="appearance" />
      </h2>

      <Switch checked={isDarkMode()} onChange={() => toggleDarkMode()}>
        <T id="darkMode" />
      </Switch>
    </div>
  );
}

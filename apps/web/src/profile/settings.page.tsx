import { Component } from 'solid-js';

import { Switch } from '../components/switch';
import { Translate } from '../intl/translate';

const T = Translate.prefix('profile.settings');

export const SettingsPage: Component = () => {
  const isDarkMode = () => localStorage.getItem('dark') === 'true';

  const toggleDarkMode = () => {
    localStorage.setItem('dark', String(!isDarkMode()));

    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(isDarkMode() ? 'dark' : 'light');
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
    </>
  );
};

import { createEffect, createSignal } from 'solid-js';

import { Card } from 'src/components/card';
import { Switch } from 'src/components/switch';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.profile.settings.ui');

export function UISettings() {
  const [darkMode, setDarkMode] = createSignal(localStorage.getItem('dark') === 'true');

  createEffect(() => {
    if (String(darkMode()) !== localStorage.getItem('dark')) {
      localStorage.setItem('dark', String(darkMode()));

      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(darkMode() ? 'dark' : 'light');
    }
  });

  return (
    <Card title={<T id="title" />} classes={{ content: 'max-w-xl' }}>
      <Switch checked={darkMode()} onChange={() => setDarkMode(!darkMode())}>
        <T id="darkMode" />
      </Switch>
    </Card>
  );
}

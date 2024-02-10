import { Feature, hasFeatureFlag, setFeatureFlag } from '../../../components/feature-flag';
import { Switch } from '../../../components/switch';
import { Translate } from '../../../intl/translate';

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
    </>
  );
}

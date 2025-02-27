import { AppVersion } from './components/app-version';
import { NotificationSettings } from './components/notification-settings';
import { UISettings } from './components/ui-settings';

export function SettingsPage() {
  return (
    <>
      <NotificationSettings />
      <UISettings />
      <AppVersion />
    </>
  );
}

import { getAppConfig } from 'src/application/config';
import { Card } from 'src/components/card';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.profile.settings.appVersion');

export function AppVersion() {
  return (
    <Card title={<T id="title" />} classes={{ content: 'max-w-xl' }}>
      {getAppConfig().version}
    </Card>
  );
}

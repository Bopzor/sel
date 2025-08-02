import { Card } from 'src/components/card';
import { createTranslate } from 'src/intl/translate';

import pkg from '../../../../../package.json';

const T = createTranslate('pages.profile.settings.appVersion');

export function AppVersion() {
  return (
    <Card title={<T id="title" />} classes={{ content: 'max-w-xl' }}>
      {pkg.version}
    </Card>
  );
}

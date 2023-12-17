import { Button } from '../../components/button';
import { Translate } from '../../intl/translate';
import { notify } from '../../utils/notify';

const T = Translate.prefix('requests');

export function CreateExchange() {
  const t = T.useTranslation();

  return (
    <Button variant="primary" onClick={() => notify.info(t('notAvailable'))}>
      <T id="createExchange" />
    </Button>
  );
}

import { useIntl } from '@cookbook/solid-intl';
import { Request } from '@sel/shared';

import { Translate } from '../../intl/translate';

const T = Translate.prefix('requests');

type TitleProps = {
  request?: Request;
};

export function Title(props: TitleProps) {
  const intl = useIntl();

  return (
    <div class="col mb-6 gap-2">
      <h1>{props.request?.title}</h1>

      <div class="text-sm text-dim">
        <T
          id="date"
          values={{
            date: intl.formatDate(props.request?.date, {
              dateStyle: 'long',
              timeStyle: 'short',
            }),
          }}
        />
      </div>
    </div>
  );
}

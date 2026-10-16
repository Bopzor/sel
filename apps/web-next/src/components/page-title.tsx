import type { MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react/macro';

import { useConfig } from 'src/app/config';

export function PageTitle({ title }: { title: string | MessageDescriptor }) {
  const { i18n } = useLingui();
  const { letsName } = useConfig();

  return <title>{`${typeof title === 'string' ? title : i18n._(title)} - ${letsName}`}</title>;
}

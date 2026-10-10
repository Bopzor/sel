import { useLingui } from '@lingui/react/macro';
import { Toaster as BaseToaster } from '@sel/ui';

export function Toaster() {
  const { t } = useLingui();

  return <BaseToaster closeLabel={t`Close`} />;
}

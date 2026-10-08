import { useLingui } from '@lingui/react/macro';
import { showToast } from '@sel/ui';

export function useClipboard() {
  const { t } = useLingui();

  return {
    copy: (text: string, onSuccess: () => void) => {
      navigator.clipboard.writeText(text).then(onSuccess, () => showToast(t`Unable to copy`, 'error'));
    },
  };
}

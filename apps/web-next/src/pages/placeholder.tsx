import type { MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react/macro';

export function PlaceholderPage({ title }: { title: MessageDescriptor }) {
  const { t } = useLingui();

  return <h1 className="text-title-1">{t(title)}</h1>;
}

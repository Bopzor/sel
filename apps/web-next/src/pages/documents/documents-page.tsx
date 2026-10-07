import { Trans } from '@lingui/react/macro';

import { DocumentsList } from './documents-list';

export function DocumentsPage() {
  return (
    <div className="stack max-w-content gap-6">
      <h1 className="text-title-1">
        <Trans>Documents</Trans>
      </h1>

      <DocumentsList />
    </div>
  );
}

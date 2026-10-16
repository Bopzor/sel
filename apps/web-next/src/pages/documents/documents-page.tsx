import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

import { PageTitle } from 'src/components/page-title';

import { DocumentsList } from './documents-list';

export function DocumentsPage() {
  return (
    <div className="stack max-w-content gap-6">
      <PageTitle title={msg`Documents`} />

      <h1 className="text-title-1">
        <Trans>Documents</Trans>
      </h1>

      <DocumentsList />
    </div>
  );
}

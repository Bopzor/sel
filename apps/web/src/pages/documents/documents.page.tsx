import { Document } from '@sel/shared';
import { useQuery } from '@tanstack/solid-query';
import clsx from 'clsx';
import { For } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { Card } from 'src/components/card';
import { ExternalLink } from 'src/components/link';
import { BoxSkeleton } from 'src/components/skeleton';
import { Table, TableColumn } from 'src/components/table';
import { FormattedBytes, FormattedDate } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.documents');

export function DocumentsPage() {
  const documentsQuery = useQuery(() => ({
    ...apiQuery('listDocuments', {}),
  }));

  return (
    <div>
      <h1 class="mb-8">
        <T id="title" />
      </h1>

      <div class="col gap-8">
        <For each={documentsQuery.data} fallback={<Skeleton />}>
          {(group) => (
            <Card title={group.name} padding={false}>
              <DocumentsTable group={group.name} documents={group.documents} />
            </Card>
          )}
        </For>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <ul class="col gap-4">
      <For each={Array(4).fill(null)}>
        {() => (
          <li>
            <BoxSkeleton height={3} />
          </li>
        )}
      </For>
    </ul>
  );
}

function DocumentsTable(props: { group: string; documents: Document[] }) {
  const columns = new Array<TableColumn<Document>>(
    {
      header: () => 'Document',
      cell: (doc) => (
        <ExternalLink openInNewTab href={doc.url} class="text-link underline">
          {doc.name}
        </ExternalLink>
      ),
    },
    {
      header: () => 'Date',
      headerClass: clsx('md:w-48'),
      cell: (doc) => <FormattedDate date={doc.updated} />,
    },
    {
      header: () => 'Taille',
      headerClass: clsx('max-sm:hidden md:w-48'),
      cell: (doc) => <FormattedBytes bytes={doc.size} />,
    },
  );

  return (
    <Table
      columns={columns}
      items={props.documents}
      classes={{
        root: 'w-full',
        td: (_, column) => clsx(column === columns[2] && 'max-sm:hidden'),
      }}
    />
  );
}

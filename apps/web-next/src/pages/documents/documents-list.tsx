import { Trans, useLingui } from '@lingui/react/macro';
import type { Document, DocumentsGroup } from '@sel/shared';
import { Card, EmptyState, Icon, ListItem, Skeleton } from '@sel/ui';
import { useQuery } from '@tanstack/react-query';

import { documentUrl } from 'src/app/api';
import { formatFileSize } from 'src/app/format';
import { queries } from 'src/app/queries';
import { ApiFailed } from 'src/components/api-result';
import { Bullet } from 'src/components/bullet';
import { RelativeDate } from 'src/components/relative-date';

export function DocumentsList() {
  const query = useQuery(queries.listDocuments());

  // With data, a failed refetch keeps the list on screen.
  if (query.error && !query.data) {
    return (
      <ApiFailed
        title={<Trans>Unable to load the documents</Trans>}
        retrying={query.isFetching}
        retry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) {
    return <DocumentsListSkeleton />;
  }

  const groups = query.data;

  if (groups.length === 0) {
    return <NoDocuments />;
  }

  return (
    <div className="stack gap-8">
      {groups.map((group, index) => (
        <DocumentsSection key={index} group={group} />
      ))}
    </div>
  );
}

function DocumentsSection({ group }: { group: DocumentsGroup }) {
  return (
    <section className="stack gap-3">
      <h2 className="text-title-3">{group.name}</h2>

      <Card.Root>
        <ul>
          {group.documents.map((document) => (
            <DocumentItem key={document.url} document={document} />
          ))}
        </ul>
      </Card.Root>
    </section>
  );
}

function DocumentItem({ document }: { document: Document }) {
  const { i18n } = useLingui();
  const type = getFileType(document);

  return (
    <ListItem.Root>
      <Icon name="document" className="text-muted" />

      <ListItem.Content>
        <ListItem.Title>
          <ListItem.Link href={documentUrl(document)} target="_blank" rel="noreferrer">
            {document.name}
          </ListItem.Link>
        </ListItem.Title>

        <ListItem.Description>
          {type && (
            <>
              {type}
              <Bullet />
            </>
          )}
          {formatFileSize(document.size, i18n.locale)}
          <Bullet />
          <RelativeDate date={document.updated} />
        </ListItem.Description>
      </ListItem.Content>
    </ListItem.Root>
  );
}

function getFileType({ name }: Document) {
  return /\.([^.]+)$/.exec(name)?.[1]?.toUpperCase();
}

function DocumentsListSkeleton() {
  return (
    <div aria-busy className="stack gap-8">
      {[3, 2].map((count, index) => (
        <div key={index} className="stack gap-3">
          <Skeleton className="h-6 w-48" />

          <Card.Root>
            {Array.from({ length: count }, (_, index) => (
              <div key={index} className="row min-h-16 items-center gap-3 px-4 py-3 not-last:border-b">
                <Skeleton variant="rect" className="size-6" />
                <div className="stack flex-1 gap-2">
                  <Skeleton className="w-2/3" />
                  <Skeleton className="w-1/3" />
                </div>
              </div>
            ))}
          </Card.Root>
        </div>
      ))}
    </div>
  );
}

function NoDocuments() {
  return (
    <EmptyState.Root icon="document">
      <EmptyState.Title>
        <Trans>No documents</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>
          The documents shared by the committee, such as the statutes and the meeting minutes, appear here.
        </Trans>
      </EmptyState.Description>
    </EmptyState.Root>
  );
}

import { Trans } from '@lingui/react/macro';
import type { Information } from '@sel/shared';
import { Avatar, Card, LinkButton, Skeleton } from '@sel/ui';
import { defined } from '@sel/utils';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { formatMemberName } from 'src/app/format';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed, QueryResult } from 'src/components/api-result';
import { CommentsSection } from 'src/components/comments-section';
import { BackButton, Link } from 'src/components/link';
import { MemberAvatar } from 'src/components/member-avatar';
import { MessageContent } from 'src/components/message-content';
import { RelativeDate } from 'src/components/relative-date';

import { InformationNotFound } from '../information-not-found';

export function InformationDetailsPage() {
  const informationId = defined(useParams().informationId);
  const query = useQuery(queries.information(informationId));

  return (
    <div className="stack gap-4">
      <BackButton href={routes.information()}>
        <Trans>Information</Trans>
      </BackButton>

      <QueryResult
        query={query}
        notFound={<InformationNotFound />}
        failed={
          <ApiFailed
            title={<Trans>Unable to load the information</Trans>}
            retrying={query.isFetching}
            retry={() => void query.refetch()}
          />
        }
        loading={<InformationSkeleton />}
      >
        {(information) => <InformationDetails information={information} />}
      </QueryResult>
    </div>
  );
}

// From xl, the aside spans both rows, so that the comments follow the message whatever the aside's height.
function InformationDetails({ information }: { information: Information }) {
  const { data: me } = useSuspenseQuery(queries.session());
  const isAuthor = information.author?.id === me.id;

  return (
    <div className="stack gap-6">
      <header className="stack gap-1">
        <h1 className="text-title-1">{information.title}</h1>
        <RelativeDate date={information.publishedAt} className="text-body-sm text-muted" />
      </header>

      <div className="stack gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:grid-rows-[auto_1fr] xl:items-start xl:gap-x-10">
        <Card.Root className="max-w-content">
          <Card.Body>
            <MessageContent message={information.message} />
          </Card.Body>
        </Card.Root>

        <aside className="stack max-w-content gap-6 xl:sticky xl:top-10 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:w-aside">
          <AuthorCard information={information} />
          {isAuthor && <AuthorActionsCard information={information} />}
        </aside>

        <div className="max-w-content">
          <CommentsSection entityType="information" entityId={information.id} />
        </div>
      </div>
    </div>
  );
}

function AuthorCard({ information }: { information: Information }) {
  const { data: config } = useSuspenseQuery(queries.config());
  const author = information.author;

  const wrap = (props: { className?: string; children: React.ReactNode }) => {
    if (author) {
      return <Link href={routes.member(author.id)} {...props} />;
    } else {
      return <div {...props} />;
    }
  };

  return (
    <Card.Root>
      <Card.Body>
        {wrap({
          className: 'row items-center gap-3',
          children: (
            <>
              {author ? (
                <MemberAvatar member={author} size="lg" decorative />
              ) : (
                <Avatar src={config.logoUrl} name={config.letsName} size="lg" decorative />
              )}

              <div className="stack min-w-0">
                <p className="text-body-sm text-muted">
                  <Trans>Published by</Trans>
                </p>
                <h2 className="text-title-3">{author ? formatMemberName(author) : config.letsName}</h2>
              </div>
            </>
          ),
        })}
      </Card.Body>
    </Card.Root>
  );
}

function AuthorActionsCard({ information }: { information: Information }) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level={2}>
          <Trans>Your information</Trans>
        </Card.Title>

        <Card.Description>
          <Trans>Keep it up to date for the members who read it.</Trans>
        </Card.Description>
      </Card.Header>

      <Card.Footer>
        <LinkButton
          Link={Link}
          href={routes.editInformation(information.id)}
          variant="secondary"
          icon="edit"
          className="grow"
        >
          <Trans>Edit</Trans>
        </LinkButton>
      </Card.Footer>
    </Card.Root>
  );
}

function InformationSkeleton() {
  return (
    <div aria-busy className="stack gap-6">
      <div className="stack gap-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="w-24" />
      </div>

      <Card.Root className="max-w-content">
        <Card.Body className="stack gap-3">
          <Skeleton />
          <Skeleton />
          <Skeleton className="w-1/2" />
        </Card.Body>
      </Card.Root>
    </div>
  );
}

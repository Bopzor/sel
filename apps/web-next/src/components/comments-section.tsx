import { Plural, Trans } from '@lingui/react/macro';
import type { Comment, CommentEntityType } from '@sel/shared';
import { Card, ListItem, Skeleton } from '@sel/ui';
import { useQuery } from '@tanstack/react-query';

import { formatMemberName } from 'src/app/format';
import { queries } from 'src/app/queries';

import { ApiFailed, QueryResult } from './api-result';
import { MemberAvatar } from './member-avatar';
import { MessageContent } from './message-content';
import { RelativeDate } from './relative-date';

export function CommentsSection({
  entityType,
  entityId,
}: {
  entityType: CommentEntityType;
  entityId: string;
}) {
  const query = useQuery(queries.comments(entityType, entityId));
  const commentsCount = query.data?.length ?? 0;

  return (
    <section className="stack gap-3">
      <h2 className="text-title-3">
        {commentsCount > 0 ? (
          <Plural value={commentsCount} one="# comment" other="# comments" />
        ) : (
          <Trans>Comments</Trans>
        )}
      </h2>

      <QueryResult
        query={query}
        failed={
          <ApiFailed
            title={<Trans>Unable to load the comments</Trans>}
            retrying={query.isFetching}
            retry={() => void query.refetch()}
          />
        }
        loading={<CommentsSkeleton />}
        empty={
          <p className="text-body-sm text-muted">
            <Trans>No comments yet.</Trans>
          </p>
        }
      >
        {(comments) => (
          <Card.Root>
            <CommentsList comments={comments} />
          </Card.Root>
        )}
      </QueryResult>
    </section>
  );
}

function CommentsList({ comments }: { comments: Comment[] }) {
  return (
    <ul>
      {comments.map((comment) => (
        <ListItem.Root key={comment.id}>
          <MemberAvatar member={comment.author} size="sm" decorative className="self-start" />

          <ListItem.Content>
            <ListItem.Header>
              <ListItem.Title className="text-body-strong">{formatMemberName(comment.author)}</ListItem.Title>
              <RelativeDate date={comment.date} className="text-caption text-subtle" />
            </ListItem.Header>

            <MessageContent message={comment.message} />
          </ListItem.Content>
        </ListItem.Root>
      ))}
    </ul>
  );
}

function CommentsSkeleton() {
  return (
    <Card.Root aria-busy>
      <ul>
        {Array.from({ length: 2 }, (_, index) => (
          <ListItem.Root key={index}>
            <Skeleton variant="circle" size="sm" />
            <div className="stack flex-1 gap-2">
              <Skeleton className="w-1/3" />
              <Skeleton />
            </div>
          </ListItem.Root>
        ))}
      </ul>
    </Card.Root>
  );
}

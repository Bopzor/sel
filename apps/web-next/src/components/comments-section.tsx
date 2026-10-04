import { Plural, Trans, useLingui } from '@lingui/react/macro';
import {
  createCommentBodySchema,
  type Comment,
  type CommentEntityType,
  type CreateCommentBody,
} from '@sel/shared';
import { Button, Card, Field, ListItem, RichTextEditor, showToast, Skeleton } from '@sel/ui';
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useController, useForm } from 'react-hook-form';

import { api } from 'src/app/api';
import { formatMemberName } from 'src/app/format';
import { queries } from 'src/app/queries';
import { useZodResolver } from 'src/hooks/use-zod-resolver';

import { ApiFailed, QueryResult } from './api-result';
import { MemberAvatar } from './member-avatar';
import { MessageContent } from './message-content';
import { RelativeDate } from './relative-date';
import { RichTextToolbar } from './rich-text-toolbar';

type CommentSectionProps = {
  entityType: CommentEntityType;
  entityId: string;
};

export function CommentsSection({ entityType, entityId }: CommentSectionProps) {
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
      >
        {(comments) => (
          <Card.Root>
            <CommentsList entityType={entityType} entityId={entityId} comments={comments} />
          </Card.Root>
        )}
      </QueryResult>
    </section>
  );
}

type CommentsListProps = {
  entityType: CommentEntityType;
  entityId: string;
  comments: Comment[];
};

function CommentsList({ entityType, entityId, comments }: CommentsListProps) {
  return (
    <ul>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}

      <CommentForm entityType={entityType} entityId={entityId} />
    </ul>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <ListItem.Root>
      <MemberAvatar member={comment.author} size="sm" decorative className="self-start" />

      <ListItem.Content>
        <ListItem.Header>
          <ListItem.Title className="text-body-strong">{formatMemberName(comment.author)}</ListItem.Title>
          <RelativeDate date={comment.date} className="text-caption text-subtle" />
        </ListItem.Header>

        <MessageContent message={comment.message} />
      </ListItem.Content>
    </ListItem.Root>
  );
}

function CommentForm({ entityType, entityId }: CommentSectionProps) {
  const { t } = useLingui();
  const { data: me } = useSuspenseQuery(queries.session());

  const queryClient = useQueryClient();

  const form = useForm({
    resolver: useZodResolver(createCommentBodySchema.pick({ body: true })),
    defaultValues: {
      body: '',
    },
  });

  const postComment = useMutation({
    mutationFn: (body: CreateCommentBody) => api('POST', '/comment', { body }),
    onSuccess: async () => {
      form.reset();
      await queryClient.invalidateQueries(queries.comments(entityType, entityId));
    },
    onError: () => {
      // exception: show a toast instead of an alert
      showToast(t`An error happened and your comment was not posted`, 'error');
    },
  });

  const handleSend = () => {
    void form.handleSubmit(({ body }) => postComment.mutate({ entityType, entityId, body, fileIds: [] }))();
  };

  const { field, fieldState } = useController({ control: form.control, name: 'body' });

  return (
    <ListItem.Root>
      <Field.Root invalid={fieldState.invalid} className="grid grow grid-cols-[auto_1fr]">
        <RichTextEditor.Root {...field} placeholder={t`Write a comment`}>
          <MemberAvatar member={me} size="sm" decorative />

          <ListItem.Content>
            <ListItem.Header>
              <ListItem.Title className="text-body-strong">{formatMemberName(me)}</ListItem.Title>
            </ListItem.Header>

            <RichTextEditor.EditorContent className="stack min-h-20" />
          </ListItem.Content>

          <div className="col-span-2">
            <Field.Error>{fieldState.error?.message}</Field.Error>

            <RichTextEditor.Toolbar>
              <RichTextToolbar.Bold />
              <RichTextToolbar.Italic />
              <RichTextToolbar.Underline className="max-xs:hidden" />
              <RichTextToolbar.Link />
              <RichTextToolbar.BulletList className="max-sm:hidden" />
              <RichTextToolbar.OrderedList className="max-sm:hidden" />
              <RichTextToolbar.Attachment />
              <RichTextEditor.ToolbarEnd>
                <Button
                  variant="secondary"
                  size="sm"
                  icon="send"
                  loading={postComment.isPending}
                  onClick={handleSend}
                >
                  <Trans>Send</Trans>
                </Button>
              </RichTextEditor.ToolbarEnd>
            </RichTextEditor.Toolbar>
          </div>
        </RichTextEditor.Root>
      </Field.Root>
    </ListItem.Root>
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

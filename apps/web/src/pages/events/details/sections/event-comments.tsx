import { Event } from '@sel/shared';
import { useMutation } from '@tanstack/solid-query';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { useInvalidateApi } from 'src/application/query';
import { Card } from 'src/components/card';
import { CommentForm, CommentList } from 'src/components/comments';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.events.details.comments');

export function EventComments(props: { event: Event }) {
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();

  const mutation = useMutation(() => ({
    async mutationFn(body: string) {
      await api.createEventComment({
        path: { eventId: props.event.id },
        body: { body },
      });
    },
    async onSuccess() {
      await invalidate('getEvent', { path: { eventId: props.event.id } });
      notify.success(t('createComment.success'));
    },
  }));

  return (
    <Card title={<T id="title" />} padding={false} class="divide-y">
      <CommentList comments={props.event.comments} />
      <CommentForm
        placeholder={t('createComment.placeholder')}
        loading={mutation.isPending}
        onSubmit={(html) => mutation.mutateAsync(html)}
      />
    </Card>
  );
}

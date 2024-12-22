import { Request } from '@sel/shared';
import { createMutation } from '@tanstack/solid-query';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { useInvalidateApi } from 'src/application/query';
import { Card } from 'src/components/card';
import { CommentForm, CommentList } from 'src/components/comments';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.requests.details.comments');

export function RequestComments(props: { request: Request }) {
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();

  const mutation = createMutation(() => ({
    async mutationFn(body: string) {
      await api.createRequestComment({
        path: { requestId: props.request.id },
        body: { body },
      });
    },
    async onSuccess() {
      await invalidate('getRequest', { path: { requestId: props.request.id } });
      notify.success(t('createComment.success'));
    },
  }));

  return (
    <Card title={<T id="title" />} padding={false} class="divide-y">
      <CommentList comments={props.request.comments} />
      <CommentForm
        placeholder={t('createComment.placeholder')}
        loading={mutation.isPending}
        onSubmit={(html) => mutation.mutateAsync(html)}
      />
    </Card>
  );
}

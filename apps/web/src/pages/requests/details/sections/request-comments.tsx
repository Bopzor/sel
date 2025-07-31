import { CreateCommentBody, Request } from '@sel/shared';
import { useMutation } from '@tanstack/solid-query';

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

  const mutation = useMutation(() => ({
    async mutationFn(body: CreateCommentBody) {
      await api.createRequestComment({
        path: { requestId: props.request.id },
        body,
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
        onSubmit={(body) => mutation.mutateAsync(body)}
      />
    </Card>
  );
}

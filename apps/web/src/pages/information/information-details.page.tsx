import { CreateCommentBody, Information } from '@sel/shared';
import { useParams } from '@solidjs/router';
import { useMutation, useQuery } from '@tanstack/solid-query';
import { Show } from 'solid-js';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { apiQuery, useInvalidateApi } from 'src/application/query';
import { Card } from 'src/components/card';
import { CommentForm, CommentList } from 'src/components/comments';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { Message } from 'src/components/message';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.information');

export function InformationDetailsPage() {
  const { informationId } = useParams<{ informationId: string }>();
  const query = useQuery(() => apiQuery('getInformation', { path: { informationId } }));

  return (
    <div class="col gap-8">
      <Card title={<MemberAvatarName member={query.data?.author} />}>
        <h1 class="mb-4 text-3xl">{query.data?.title}</h1>
        <Message message={query.data?.message} />
      </Card>

      <Show when={query.data}>{(information) => <InformationComments information={information()} />}</Show>
    </div>
  );
}

export function InformationComments(props: { information: Information }) {
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();

  const mutation = useMutation(() => ({
    async mutationFn(body: CreateCommentBody) {
      await api.createComment({
        body: { ...body, type: 'information', entityId: props.information.id },
      });
    },
    async onSuccess() {
      await invalidate('getInformation', { path: { informationId: props.information.id } });
      notify.success(t('createComment.success'));
    },
  }));

  return (
    <Card title={<T id="createComment.title" />} padding={false} classes={{ content: 'divide-y' }}>
      <CommentList comments={props.information.comments} />
      <CommentForm
        placeholder={t('createComment.placeholder')}
        loading={mutation.isPending}
        onSubmit={(body) => mutation.mutateAsync(body)}
      />
    </Card>
  );
}

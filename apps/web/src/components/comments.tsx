import { createForm, setValue } from '@modular-forms/solid';
import {
  Attachment,
  Comment,
  CommentEntityType,
  CreateCommentBody,
  createCommentBodySchema,
} from '@sel/shared';
import { ReactiveMap } from '@solid-primitives/map';
import { useMutation, useQuery } from '@tanstack/solid-query';
import { For, Show } from 'solid-js';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { apiQuery, getAuthenticatedMember, useInvalidateApi } from 'src/application/query';
import { FormattedDate } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';
import { createFileUploadHandler } from 'src/utils/file-upload';
import { createId } from 'src/utils/id';
import { zodForm } from 'src/utils/validation';

import { AttachmentEditorList } from './attachments-editor';
import { Button } from './button';
import { Card } from './card';
import { MemberAvatarName } from './member-avatar-name';
import { Message } from './message';
import { createRichEditor, RichEditorToolbar } from './rich-editor';

const T = createTranslate('components.comments');

export function Comments(props: { type: CommentEntityType; entityId: string }) {
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();

  const query = useQuery(() =>
    apiQuery('getComments', { query: { type: props.type, entityId: props.entityId } }),
  );

  const mutation = useMutation(() => ({
    async mutationFn(body: CreateCommentBody) {
      await api.createComment({
        body: { ...body, type: props.type, entityId: props.entityId },
      });
    },
    async onSuccess() {
      await invalidate('getComments', { query: { type: props.type, entityId: props.entityId } });
      notify.success(t('createComment.success'));
    },
  }));

  return (
    <Card title={<T id="title" />} padding={false} classes={{ content: 'divide-y' }}>
      <Show when={query.data}>{(comments) => <CommentList comments={comments()} />}</Show>
      <CommentForm
        placeholder={t('createComment.placeholder')}
        loading={mutation.isPending}
        onSubmit={(body) => mutation.mutateAsync(body)}
      />
    </Card>
  );
}

export function CommentList(props: { comments: Comment[] }) {
  return (
    <Show when={props.comments.length > 0}>
      <div class="col gap-4 p-4">
        <For each={props.comments}>
          {(comment) => (
            <div>
              <div class="row items-center justify-between">
                <MemberAvatarName member={comment.author} />

                <div class="text-xs text-dim">
                  <FormattedDate date={comment.date} dateStyle="short" timeStyle="short" />
                </div>
              </div>

              <Message class="mt-2 ml-10" message={comment.message} attachmentsSeparator={false} />
            </div>
          )}
        </For>
      </div>
    </Show>
  );
}

const TCommon = createTranslate('common');

export function CommentForm(props: {
  placeholder: string;
  loading: boolean;
  onSubmit: (body: Omit<CreateCommentBody, 'type' | 'entityId'>) => Promise<void>;
}) {
  const member = getAuthenticatedMember();
  const id = createId(() => undefined);

  let ref!: HTMLDivElement;

  const [form, { Form, Field }] = createForm<{ body: string }>({
    initialValues: { body: '' },
    validate: zodForm(createCommentBodySchema),
  });

  const editor = createRichEditor({
    element: () => ref,
    placeholder: props.placeholder,
    onChange: (body) => setValue(form, 'body', body),
  });

  const attachments = new ReactiveMap<string, Attachment>();
  const upload = createFileUploadHandler((file) => attachments.set(file.id, { fileId: file.id, ...file }));

  const onSubmit = (values: { body: string }) => {
    return props.onSubmit({ ...values, fileIds: Array.from(attachments.keys()) }).then(() => {
      editor()?.chain().clearContent().run();
      attachments.clear();
    });
  };

  return (
    <Form class="p-4 pb-2" onSubmit={onSubmit}>
      <div class="row items-center justify-between">
        <MemberAvatarName member={member()} />
      </div>

      <div ref={ref} id={id()} class="my-2 ml-10 col min-h-32 outline-hidden" />

      <Show when={attachments.size > 0}>
        <AttachmentEditorList
          value={Array.from(attachments.values())}
          onRemove={(attachment) => attachments.delete(attachment.fileId)}
          class="mb-4 col gap-2"
        />
      </Show>

      <Field name="body">
        {(field) => (
          <Show when={field.error}>
            <div id={`${id()}-helper-text`} class="text-sm text-red-700">
              {field.error}
            </div>
          </Show>
        )}
      </Field>

      <div class="row flex-wrap items-center justify-between gap-4">
        <RichEditorToolbar editor={editor()} onFileAdded={upload} />

        <Button type="submit" variant="outline" loading={props.loading}>
          <TCommon id="send" />
        </Button>
      </div>
    </Form>
  );
}

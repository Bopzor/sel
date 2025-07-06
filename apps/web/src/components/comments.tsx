import { createForm, setValue } from '@modular-forms/solid';
import { Comment, createCommentBodySchema } from '@sel/shared';
import { For, Show } from 'solid-js';

import { getAuthenticatedMember } from 'src/application/query';
import { FormattedDate } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';
import { createId } from 'src/utils/id';
import { createErrorMap, zodForm } from 'src/utils/validation';

import { Button } from './button';
import { MemberAvatarName } from './member-avatar-name';
import { RichEditorToolbar, createRichEditor } from './rich-editor';
import { RichText } from './rich-text';

const T = createTranslate('common');

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

              <RichText class="mt-2 ml-10">{comment.body}</RichText>
            </div>
          )}
        </For>
      </div>
    </Show>
  );
}

export function CommentForm(props: {
  placeholder: string;
  loading: boolean;
  onSubmit: (html: string) => Promise<void>;
}) {
  const member = getAuthenticatedMember();
  const id = createId(() => undefined);

  let ref!: HTMLDivElement;

  const [form, { Form, Field }] = createForm<{ body: string }>({
    initialValues: { body: '' },
    validate: zodForm(createCommentBodySchema, { errorMap: createErrorMap() }),
  });

  const editor = createRichEditor({
    element: () => ref,
    placeholder: props.placeholder,
    onChange: (body) => setValue(form, 'body', body),
  });

  return (
    <Form
      class="p-4 pb-2"
      onSubmit={(values) => {
        props.onSubmit(values.body).then(() => editor()?.chain().clearContent().run());
      }}
    >
      <Field name="body">
        {(field) => (
          <>
            <div class="row items-center justify-between">
              <MemberAvatarName member={member()} />
            </div>

            <div ref={ref} id={id()} class="my-2 ml-10 col min-h-32 outline-hidden" />

            <Show when={field.error}>
              <div id={`${id()}-helper-text`} class="text-sm text-red-700">
                {field.error}
              </div>
            </Show>

            <div class="row flex-wrap items-center justify-between gap-4">
              <RichEditorToolbar editor={editor()} />

              <Button type="submit" variant="outline" loading={props.loading}>
                <T id="send" />
              </Button>
            </div>
          </>
        )}
      </Field>
    </Form>
  );
}

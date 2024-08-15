import { createForm } from '@felte/solid';
import { validateSchema } from '@nilscox/felte-validator-zod';
import { createCommentBodySchema, type Comment } from '@sel/shared';
import { For, Show } from 'solid-js';

import { authenticatedMember } from '../app-context';
import { FormattedDate } from '../intl/formatted';
import { Translate } from '../intl/translate';
import { createErrorHandler } from '../utils/create-error-handler';
import { createErrorMap } from '../utils/zod-error-map';

import { Button } from './button';
import { MemberAvatarName } from './member-avatar-name';
import { createRichEditor, RichEditorToolbar } from './rich-editor';
import { RichText } from './rich-text';

const T = Translate.prefix('common.commentsSection');

type CommentsSectionProps = {
  comments: Comment[];
  onCreate: (html: string) => Promise<void>;
  onCreated: () => void;
};

export function CommentsSection(props: CommentsSectionProps) {
  return (
    <div class="card">
      <Show when={props.comments.length}>
        <CommentsList comments={props.comments} />
        <hr />
      </Show>

      <CreateCommentForm onCreate={props.onCreate} onCreated={props.onCreated} />
    </div>
  );
}

function CommentsList(props: { comments: Comment[] }) {
  return (
    <ul class="col gap-4 p-4">
      <For each={props.comments}>{(comment) => <Comment comment={comment} />}</For>
    </ul>
  );
}

function Comment(props: { comment: Comment }) {
  return (
    <li>
      <div class="row items-center justify-between pb-2">
        <div class="row items-center gap-2">
          <MemberAvatarName member={props.comment.author} />
        </div>

        <div class="text-xs text-dim">
          <FormattedDate date={props.comment.date} dateStyle="short" timeStyle="short" />
        </div>
      </div>

      <RichText class="prose ml-8 pl-2">{props.comment.body}</RichText>
    </li>
  );
}

function CreateCommentForm(props: { onCreate: (html: string) => Promise<void>; onCreated: () => void }) {
  const t = T.useTranslation();

  // @ts-expect-error solidjs directive
  const { form, setData, reset, isSubmitting, errors } = createForm({
    initialValues: {
      body: '',
    },
    validate: validateSchema(createCommentBodySchema, {
      errorMap: createErrorMap(),
    }),
    async onSubmit(values) {
      await props.onCreate(values.body);
    },
    onSuccess() {
      reset();
      editor()?.chain().clearContent().run();
      props.onCreated();
    },
    onError: createErrorHandler(),
  });

  let ref!: HTMLDivElement;

  const editor = createRichEditor(() => ref, {
    placeholder: t('placeholder'),
    onChange: (body) => setData('body', body),
  });

  return (
    <form use:form>
      <div class="row items-center gap-2 p-4 pb-2">
        <MemberAvatarName member={authenticatedMember()} />
      </div>

      <div class="col min-h-40 resize-y overflow-auto">
        <div ref={ref} class="col ml-14 grow overflow-y-auto" />

        <div class="row items-center gap-4 p-2">
          <RichEditorToolbar editor={editor()} />

          <Show when={errors('body')}>{(error) => <div class="text-sm text-red-700">{error()}</div>}</Show>

          <Button type="submit" variant="secondary" loading={isSubmitting()} class="ml-auto">
            <T id="submit" />
          </Button>
        </div>
      </div>
    </form>
  );
}

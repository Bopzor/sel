import { useIntl } from '@cookbook/solid-intl';
import { createForm } from '@felte/solid';
import { Comment, Request } from '@sel/shared';
import { assert } from '@sel/utils';
import { For, Show } from 'solid-js';

import { Button } from '../../components/button';
import { MemberAvatarName } from '../../components/member-avatar-name';
import { RichEditor, RichEditorToolbar, createRichEditor } from '../../components/rich-editor';
import { RichText } from '../../components/rich-text';
import { Translate } from '../../intl/translate';
import { getAppState, getAppActions } from '../../store/app-store';

const T = Translate.prefix('requests.comments');

type CommentsProps = {
  request?: Request;
};

export function Comments(props: CommentsProps) {
  return (
    <div class="rounded-lg bg-neutral shadow">
      <Show when={props.request?.comments.length}>
        <CommentsList comments={props.request?.comments ?? []} />
        <hr />
      </Show>

      <CreateCommentForm requestId={props.request?.id} />
    </div>
  );
}

type CommentsListProps = {
  comments: Comment[];
};

function CommentsList(props: CommentsListProps) {
  const intl = useIntl();

  return (
    <ul class="col gap-4 p-4">
      <For each={props.comments}>
        {(comment) => (
          <li>
            <div class="row items-center justify-between">
              <div class="row items-center gap-2 pb-2">
                <MemberAvatarName member={comment.author} />
              </div>

              <div class="text-xs text-dim">
                {intl.formatDate(comment.date, { dateStyle: 'short', timeStyle: 'short' })}
              </div>
            </div>

            <RichText class="prose ml-2 pl-8">{comment.body}</RichText>
          </li>
        )}
      </For>
    </ul>
  );
}

type CreateCommentFormProps = {
  requestId?: string;
};

function CreateCommentForm(props: CreateCommentFormProps) {
  const t = T.useTranslation();

  const state = getAppState();
  const { createRequestComment } = getAppActions();

  const { form, setData, reset, isSubmitting } = createForm({
    initialValues: {
      html: '',
    },
    async onSubmit(values) {
      assert(props.requestId);
      await createRequestComment(props.requestId, values.html);
    },
    onSuccess() {
      reset();
      editor()?.chain().clearContent().run();
    },
  });

  let ref!: HTMLDivElement;

  const editor = createRichEditor(() => ref, {
    placeholder: t('placeholder'),
    onChange: (html) => setData('html', html),
  });

  return (
    <form use:form>
      <div class="row items-center gap-2 p-4 pb-2">
        <MemberAvatarName member={state.authenticatedMember} />
      </div>

      <RichEditor ref={ref} class="min-h-[10rem] [&>:first-of-type]:ml-[3.5rem]">
        <div class="row items-end justify-between p-2">
          <RichEditorToolbar editor={editor()} />
          <Button type="submit" variant="secondary" loading={isSubmitting()}>
            <T id="submit" />
          </Button>
        </div>
      </RichEditor>
    </form>
  );
}

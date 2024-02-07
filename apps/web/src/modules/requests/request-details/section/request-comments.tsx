import { createForm } from '@felte/solid';
import { Request, type Comment } from '@sel/shared';
import { For, Show } from 'solid-js';

import { authenticatedMember } from '../../../../app-context';
import { Button } from '../../../../components/button';
import { MemberAvatarName } from '../../../../components/member-avatar-name';
import { RichEditorToolbar, createRichEditor } from '../../../../components/rich-editor';
import { RichText } from '../../../../components/rich-text';
import { container } from '../../../../infrastructure/container';
import { FormattedDate } from '../../../../intl/formatted';
import { Translate } from '../../../../intl/translate';
import { TOKENS } from '../../../../tokens';

const T = Translate.prefix('requests.comments');

export function RequestComments(props: { request: Request; onCreated: () => void }) {
  return (
    <div>
      <h2 class="mb-2">
        <T id="title" />
      </h2>

      <div class="card">
        <Show when={props.request.comments.length}>
          <CommentsList comments={props.request.comments} />
          <hr />
        </Show>

        <CreateCommentForm requestId={props.request.id} onCreated={props.onCreated} />
      </div>
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

function CreateCommentForm(props: { requestId: string; onCreated: () => void }) {
  const requestsApi = container.resolve(TOKENS.requestsApi);
  const t = T.useTranslation();

  const { form, setData, reset, isSubmitting } = createForm({
    initialValues: {
      html: '',
    },
    async onSubmit(values) {
      await requestsApi.createComment(props.requestId, values.html);
    },
    onSuccess() {
      reset();
      editor()?.chain().clearContent().run();
      props.onCreated();
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
        <MemberAvatarName member={authenticatedMember()} />
      </div>

      <div class="col min-h-[10rem] resize-y overflow-auto">
        <div ref={ref} class="col ml-[3.5rem] grow overflow-y-auto" />

        <div class="row items-end justify-between p-2">
          <RichEditorToolbar editor={editor()} />

          <Button type="submit" variant="secondary" loading={isSubmitting()}>
            <T id="submit" />
          </Button>
        </div>
      </div>
    </form>
  );
}

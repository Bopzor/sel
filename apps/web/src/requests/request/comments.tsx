import { useIntl } from '@cookbook/solid-intl';
import { createForm } from '@felte/solid';
import { Request } from '@sel/shared';
import { For } from 'solid-js';

import { Button } from '../../components/button';
import { MemberAvatarName } from '../../components/member-avatar-name';
import { RichEditor, RichEditorToolbar, createRichEditor } from '../../components/rich-editor';
import { RichText } from '../../components/rich-text';
import { Translate } from '../../intl/translate';
import { getAppState } from '../../store/app-store';

const T = Translate.prefix('requests.comments');

type CommentsProps = {
  request?: Request;
};

export function Comments(props: CommentsProps) {
  const intl = useIntl();
  const t = T.useTranslation();

  const state = getAppState();

  const { form, setData } = createForm({
    initialValues: {
      html: '',
    },
    onSubmit(values) {
      console.log(values);
    },
  });

  let ref!: HTMLDivElement;

  const editor = createRichEditor(() => ref, {
    placeholder: t('placeholder'),
    onChange: (html) => setData('html', html),
  });

  return (
    <div class="rounded-lg bg-neutral shadow">
      <ul class="col gap-4 p-4">
        <For each={props.request?.comments}>
          {(comment) => (
            <li>
              <div class="row items-center justify-between">
                <div class="row items-center gap-2">
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

      <hr />

      <form use:form>
        <div class="row items-center gap-2 p-4 pb-0">
          <MemberAvatarName member={state.authenticatedMember} />
        </div>

        <RichEditor ref={ref} class="min-h-[10rem] [&>:first-of-type]:ml-[3.5rem]">
          <div class="row items-center justify-between p-2">
            <RichEditorToolbar editor={editor()} />
            <Button type="submit" variant="secondary">
              <T id="submit" />
            </Button>
          </div>
        </RichEditor>
      </form>
    </div>
  );
}

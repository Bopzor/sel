import { useIntl } from '@cookbook/solid-intl';
import { Request } from '@sel/shared';
import { For } from 'solid-js';

import { MemberAvatarName } from '../../components/member-avatar-name';
import { RichEditor } from '../../components/rich-editor';
import { Translate } from '../../intl/translate';

const T = Translate.prefix('requests');

type CommentsProps = {
  request?: Request;
};

export function Comments(props: CommentsProps) {
  const intl = useIntl();
  const t = T.useTranslation();

  return (
    <div class="rounded-lg bg-white shadow">
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

              {/* eslint-disable-next-line solid/no-innerhtml */}
              <div class="prose ml-2 max-w-none pl-8" innerHTML={comment.body} />
            </li>
          )}
        </For>
      </ul>

      <hr />

      <div>
        <RichEditor placeholder={t('commentPlaceholder')} class="min-h-[10rem]" />
      </div>
    </div>
  );
}

import { useParams } from '@solidjs/router';
import { Show, onMount } from 'solid-js';

import { BackLink } from '../../components/back-link';
import { Link } from '../../components/link';
import { SuspenseLoader } from '../../components/loader';
import { MemberAvatarName } from '../../components/member-avatar-name';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';
import { getAppActions, getAppState, select, selectIsRequester } from '../../store/app-store';

import { AnswersList } from './answers-list';
import { AuthorInfo } from './author-info';
import { Comments } from './comments';
import { CreateExchange } from './create-exchange';
import { MemberAnswer } from './member-answer';
import { Message } from './message';
import { Title } from './title';

const T = Translate.prefix('requests');

export function RequestPage() {
  const { requestId } = useParams<{ requestId: string }>();

  const state = getAppState();
  const { loadRequest } = getAppActions();

  const isRequester = select(selectIsRequester);

  onMount(() => loadRequest(requestId));

  return (
    <>
      <BackLink href={routes.requests.list} />

      <SuspenseLoader>
        <Title request={state.request} />

        <div class="col sm:row gap-6">
          <div class="col flex-2 gap-6">
            <section class="sm:hidden">
              <Link
                href={routes.members.member(state.request?.requester.id ?? '')}
                unstyled
                class="row items-center gap-4"
              >
                <MemberAvatarName member={state.request?.requester} classes={{ name: 'text-lg' }} />
              </Link>
            </section>

            <section>
              <Message request={state.request} />
            </section>

            <section class="col sm:hidden">
              <CreateExchange request={state.request} />
            </section>

            <Show when={!isRequester()}>
              <hr />

              <section>
                <h2 class="mb-4">
                  <T id="answer.title" />
                </h2>
                <MemberAnswer request={state.request} />
              </section>
            </Show>

            <hr />

            <section>
              <h2 class="mb-4">
                <T id="comments.title" />
              </h2>
              <Comments request={state.request} />
            </section>
          </div>

          <div class="sm:col hidden flex-1 gap-4">
            <AuthorInfo request={state.request} />
            <CreateExchange request={state.request} />

            <Show when={isRequester()}>
              <hr />

              <section>
                <h2 class="mb-4">
                  <T id="answersList.title" />
                </h2>
                <AnswersList request={state.request} />
              </section>
            </Show>
          </div>
        </div>
      </SuspenseLoader>
    </>
  );
}

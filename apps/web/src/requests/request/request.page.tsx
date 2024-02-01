import { useParams } from '@solidjs/router';
import { onMount } from 'solid-js';

import { BackLink } from '../../components/back-link';
import { Link } from '../../components/link';
import { SuspenseLoader } from '../../components/loader';
import { MemberAvatarName } from '../../components/member-avatar-name';
import { routes } from '../../routes';
import { getAppState, getAppActions } from '../../store/app-store';

import { AuthorInfo } from './author-info';
import { Comments } from './comments';
import { CreateExchange } from './create-exchange';
import { Message } from './message';
import { Title } from './title';

export function RequestPage() {
  const { requestId } = useParams<{ requestId: string }>();

  const state = getAppState();
  const { loadRequest } = getAppActions();

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

            <hr />

            <section>
              <h2 class="mb-4">Commentaires</h2>
              <Comments request={state.request} />
            </section>
          </div>

          <section class="sm:col hidden flex-1 gap-4">
            <AuthorInfo request={state.request} />
            <CreateExchange request={state.request} />
          </section>
        </div>
      </SuspenseLoader>
    </>
  );
}

import { useParams } from '@solidjs/router';
import { onMount } from 'solid-js';

import { BackLink } from '../../components/back-link';
import { SuspenseLoader } from '../../components/loader';
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

        <div class="row items-start gap-6">
          <div class="col flex-1 gap-6">
            <Message request={state.request} />
            <hr />
            <Comments request={state.request} />
          </div>

          <div class="col max-w-sm flex-1 gap-6">
            <AuthorInfo request={state.request} />
            <CreateExchange />
          </div>
        </div>
      </SuspenseLoader>
    </>
  );
}

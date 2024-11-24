import { Request, Requester } from '@sel/shared';
import { useParams } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { Show } from 'solid-js';

import { Breadcrumb, breadcrumb } from '../../../components/breadcrumb';
import { Link } from '../../../components/link';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { MemberCard } from '../../../components/member-card';
import { RichText } from '../../../components/rich-text';
import { container } from '../../../infrastructure/container';
import { routes } from '../../../routes';
import { TOKENS } from '../../../tokens';
import { getIsAuthenticatedMember } from '../../../utils/authenticated-member';

import { RequestActions } from './section/request-actions';
import { RequestAnswer } from './section/request-answer';
import { RequestAnswersList } from './section/request-answers-list';
import { RequestComments } from './section/request-comments';
import { RequestHeader } from './section/request-header';

export default function RequestDetailsPage() {
  const api = container.resolve(TOKENS.api);
  const params = useParams<{ requestId: string }>();

  const query = createQuery(() => ({
    queryKey: ['getRequest', params.requestId],
    queryFn: () => api.getRequest({ path: { requestId: params.requestId } }),
  }));

  return (
    <Show when={query.data}>
      {(request) => (
        <>
          <Breadcrumb items={[breadcrumb.requests(), breadcrumb.request(request())]} />
          <RequestDetails request={request()} />
        </>
      )}
    </Show>
  );
}

export function RequestDetails(props: { request: Request }) {
  const isAuthenticatedMember = getIsAuthenticatedMember();

  return (
    <>
      <div class="mb-6">
        <RequestHeader request={props.request} />
      </div>

      <div class="col lg:row gap-6">
        <div class="sm:hidden">
          <RequesterInfoMobile requester={props.request.requester} />
        </div>

        <div class="flex-2 col gap-6">
          <Message request={props.request} />

          <Show when={!isAuthenticatedMember(props.request.requester)}>
            <hr />

            <RequestAnswer request={props.request} />
          </Show>

          <hr />

          <RequestComments request={props.request} />
        </div>

        <div class="col flex-1 gap-4">
          <div class="hidden sm:block">
            <MemberCard member={props.request.requester} class="pt-8" />
          </div>

          <RequestActions request={props.request} />

          <hr />

          <RequestAnswersList answers={props.request.answers} />
        </div>
      </div>
    </>
  );
}

function RequesterInfoMobile(props: { requester: Requester }) {
  return (
    <Link href={routes.members.member(props.requester.id)} unstyled class="row items-center gap-4">
      <MemberAvatarName member={props.requester} classes={{ name: 'text-lg font-medium' }} />
    </Link>
  );
}

function Message(props: { request: Request }) {
  return <RichText class="card p-4 sm:p-8">{props.request.body}</RichText>;
}

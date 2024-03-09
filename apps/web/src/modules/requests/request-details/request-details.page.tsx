import { Request, Requester } from '@sel/shared';
import { useParams } from '@solidjs/router';
import { Show, createResource } from 'solid-js';

import { isAuthenticatedMember } from '../../../app-context';
import { Breadcrumb, breadcrumb } from '../../../components/breadcrumb';
import { Link } from '../../../components/link';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { MemberCard } from '../../../components/member-card';
import { RichText } from '../../../components/rich-text';
import { container } from '../../../infrastructure/container';
import { routes } from '../../../routes';
import { TOKENS } from '../../../tokens';

import { RequestActions } from './section/request-actions';
import { RequestAnswer } from './section/request-answer';
import { RequestAnswersList } from './section/request-answers-list';
import { RequestComments } from './section/request-comments';
import { RequestHeader } from './section/request-header';

export default function RequestDetailsPage() {
  const requestApi = container.resolve(TOKENS.requestApi);
  const { requestId } = useParams<{ requestId: string }>();

  const [request, { refetch }] = createResource(requestId, async (requestId) => {
    return requestApi.getRequest(requestId);
  });

  return (
    <>
      <Breadcrumb items={[breadcrumb.requests(), request.latest && breadcrumb.request(request.latest)]} />

      <Show when={request.latest}>
        {(request) => <RequestDetails request={request()} refetch={() => void refetch()} />}
      </Show>
    </>
  );
}

export function RequestDetails(props: { request: Request; refetch: () => void }) {
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

            <RequestAnswer request={props.request} onAnswerChanged={props.refetch} />
          </Show>

          <hr />

          <RequestComments request={props.request} onCreated={props.refetch} />
        </div>

        <div class="col flex-1 gap-4">
          <div class="hidden sm:block">
            <MemberCard member={props.request.requester} class="pt-8" />
          </div>

          <RequestActions request={props.request} onCanceled={props.refetch} />

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

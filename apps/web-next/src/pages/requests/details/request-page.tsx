import { Trans } from '@lingui/react/macro';
import { RequestStatus, type Request } from '@sel/shared';
import { Card, Skeleton } from '@sel/ui';
import { defined } from '@sel/utils';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed, QueryResult } from 'src/components/api-result';
import { Bullet } from 'src/components/bullet';
import { CommentsSection } from 'src/components/comments-section';
import { BackButton } from 'src/components/link';
import { MessageContent } from 'src/components/message-content';
import { RelativeDate } from 'src/components/relative-date';

import { RequestNotFound } from '../request-not-found';

import { RequestAnswerCard } from './request-answer';
import { RequestAnswers } from './request-answers';
import { RequestStatusAlert } from './request-status';
import { RequesterCard } from './requester';
import { RequesterActionsCard } from './requester-actions';

export function RequestPage() {
  const requestId = defined(useParams().requestId);
  const query = useQuery(queries.request(requestId));

  return (
    <div className="stack gap-4">
      <BackButton href={routes.requests()}>
        <Trans>Requests</Trans>
      </BackButton>

      <QueryResult
        query={query}
        notFound={<RequestNotFound />}
        failed={
          <ApiFailed
            title={<Trans>Unable to load the request</Trans>}
            retrying={query.isFetching}
            retry={() => void query.refetch()}
          />
        }
        loading={<RequestSkeleton />}
      >
        {(request) => <RequestDetails request={request} />}
      </QueryResult>
    </div>
  );
}

// From xl, the aside spans both rows, so that the comments follow the message whatever the aside's height.
function RequestDetails({ request }: { request: Request }) {
  const { data: me } = useSuspenseQuery(queries.session());
  const pending = request.status === RequestStatus.pending;
  const isRequester = request.requester.id === me.id;

  return (
    <div className="stack gap-6">
      <Header request={request} />

      <div className="stack gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:grid-rows-[auto_1fr] xl:items-start xl:gap-x-10">
        <div className="stack max-w-content gap-4">
          <RequestStatusAlert status={request.status} />

          <Card.Root>
            <Card.Body>
              <MessageContent message={request.message} />
            </Card.Body>
          </Card.Root>
        </div>

        <aside className="stack gap-6 xl:sticky xl:top-10 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:w-aside">
          <RequesterCard requester={request.requester} />
          {pending && isRequester && <RequesterActionsCard request={request} />}
          {pending && !isRequester && <RequestAnswerCard request={request} memberId={me.id} />}
          <RequestAnswers answers={request.answers} />
        </aside>

        <div className="max-w-content">
          <CommentsSection entityType="request" entityId={request.id} />
        </div>
      </div>
    </div>
  );
}

function Header({ request }: { request: Request }) {
  const positiveAnswersCount = request.answers.filter(({ answer }) => answer === 'positive').length;

  return (
    <header className="stack gap-1">
      <h1 className="text-title-1">{request.title}</h1>
      <div className="row gap-2 text-body-sm text-muted">
        <RelativeDate date={request.date} />
        {positiveAnswersCount > 0 && (
          <>
            <Bullet />
            <p>
              <Trans>{positiveAnswersCount} people can help</Trans>
            </p>
          </>
        )}
      </div>
    </header>
  );
}

function RequestSkeleton() {
  return (
    <div aria-busy className="stack gap-6">
      <div className="stack gap-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="w-24" />
      </div>

      <Card.Root className="max-w-content">
        <Card.Body className="stack gap-3">
          <Skeleton />
          <Skeleton />
          <Skeleton className="w-1/2" />
        </Card.Body>
      </Card.Root>
    </div>
  );
}

import { Trans } from '@lingui/react/macro';
import { RequestStatus, type LightMember, type Request } from '@sel/shared';
import { Button, Card, Skeleton } from '@sel/ui';
import { defined } from '@sel/utils';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router';

import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed, QueryResult } from 'src/components/api-result';
import { Bullet } from 'src/components/bullet';
import { CommentsSection } from 'src/components/comments-section';
import { BackButton } from 'src/components/link';
import { MessageContent } from 'src/components/message-content';
import { RelativeDate } from 'src/components/relative-date';
import { TransactionDialog, type TransactionDirection } from 'src/components/transaction-dialog';

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
  const canHelp = request.answers.some(({ member, answer }) => member.id === me.id && answer === 'positive');

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

        <aside className="stack max-w-content gap-6 xl:sticky xl:top-10 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:w-aside">
          <RequesterCard requester={request.requester} />
          {pending && isRequester && <RequesterActionsCard request={request} />}
          {pending && !isRequester && <RequestAnswerCard request={request} memberId={me.id} />}
          {isRequester && <CreateTransaction request={request} direction="send" />}
          {canHelp && (
            <CreateTransaction request={request} direction="request" counterpart={request.requester} />
          )}
          <RequestAnswers answers={request.answers} />
        </aside>

        <div className="max-w-content">
          <CommentsSection entityType="request" entityId={request.id} />
        </div>
      </div>
    </div>
  );
}

type CreateTransactionProps = {
  request: Request;
  direction: TransactionDirection;
  counterpart?: LightMember;
};

function CreateTransaction({ request, direction, counterpart }: CreateTransactionProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button icon="exchange" onClick={() => setOpen(true)}>
        <Trans>Create exchange</Trans>
      </Button>

      <TransactionDialog
        open={open}
        onClose={() => setOpen(false)}
        direction={direction}
        counterpart={counterpart}
        requestId={request.id}
        defaultDescription={request.title}
      />
    </>
  );
}

function Header({ request }: { request: Request }) {
  const positiveAnswersCount = request.answers.filter(({ answer }) => answer === 'positive').length;

  return (
    <header className="stack gap-1">
      <h1 className="text-title-1">{request.title}</h1>
      <div className="row flex-wrap gap-2 text-body-sm text-muted">
        <RelativeDate date={request.date} className="whitespace-nowrap" />
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

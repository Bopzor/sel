import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { RequestStatus, type Comment, type Request, type RequestAnswer, type Requester } from '@sel/shared';
import {
  Alert,
  Button,
  Card,
  Dialog,
  EmptyState,
  Icon,
  LinkButton,
  ListItem,
  showToast,
  Skeleton,
} from '@sel/ui';
import { defined } from '@sel/utils';
import {
  mutationOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useParams } from 'react-router';

import { api } from 'src/app/api';
import { formatMemberName, formatPhoneNumber } from 'src/app/format';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed, QueryResult } from 'src/components/api-result';
import { BackButton, Link } from 'src/components/link';
import { MemberAvatar } from 'src/components/member-avatar';
import { MessageContent } from 'src/components/message-content';
import { RelativeDate } from 'src/components/relative-date';
import { Unit } from 'src/components/unit';

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
      <header className="stack gap-1">
        <h1 className="text-title-1">{request.title}</h1>
        <RelativeDate date={request.date} className="text-body-sm text-muted" />
      </header>

      <div className="stack gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:grid-rows-[auto_1fr] xl:items-start xl:gap-x-10">
        <div className="stack max-w-content gap-4">
          <StatusAlert status={request.status} />

          <Card.Root>
            <Card.Body>
              <MessageContent message={request.message} />
            </Card.Body>
          </Card.Root>
        </div>

        <aside className="stack gap-6 xl:sticky xl:top-10 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:w-aside">
          <RequesterCard requester={request.requester} />
          {pending && isRequester && <RequesterActionsCard request={request} />}
          {pending && !isRequester && <AnswerCard request={request} memberId={me.id} />}
          <Answers answers={request.answers} />
        </aside>

        <div className="max-w-content">
          <Comments requestId={request.id} />
        </div>
      </div>
    </div>
  );
}

function StatusAlert({ status }: { status: RequestStatus }) {
  if (status === RequestStatus.fulfilled) {
    return (
      <Alert.Root tone="success">
        <Alert.Title>
          <Trans>This request is fulfilled</Trans>
        </Alert.Title>
      </Alert.Root>
    );
  }

  if (status === RequestStatus.canceled) {
    return (
      <Alert.Root tone="warning">
        <Alert.Title>
          <Trans>This request was canceled</Trans>
        </Alert.Title>
      </Alert.Root>
    );
  }

  return null;
}

function RequesterCard({ requester }: { requester: Requester }) {
  const { email, phoneNumber } = requester;

  const phoneNumberItem = phoneNumber !== undefined && (
    <ContactItem icon="phone" href={`tel:${phoneNumber}`}>
      {formatPhoneNumber(phoneNumber)}
    </ContactItem>
  );

  const emailItem = email !== undefined && (
    <ContactItem icon="email" href={`mailto:${email}`}>
      {email}
    </ContactItem>
  );

  return (
    <Card.Root>
      <Card.Body className="stack gap-4">
        <div className="row items-center gap-3">
          <MemberAvatar member={requester} size="lg" decorative />

          <div className="stack min-w-0">
            <p className="text-body-sm text-muted">
              <Trans>Requested by</Trans>
            </p>
            <h2 className="text-title-3">{formatMemberName(requester)}</h2>
          </div>
        </div>

        {(phoneNumberItem || emailItem) && (
          <ul className="stack gap-2 text-body-sm">
            {phoneNumberItem}
            {emailItem}
          </ul>
        )}
      </Card.Body>
    </Card.Root>
  );
}

function ContactItem({ icon, href, children }: { icon: 'phone' | 'email'; href: string; children: string }) {
  return (
    <li className="row items-center gap-2">
      <Icon name={icon} size="sm" className="text-subtle" />
      <a href={href} className="min-w-0 wrap-break-word text-primary underline">
        {children}
      </a>
    </li>
  );
}

function RequesterActionsCard({ request }: { request: Request }) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level={2}>
          <Trans>Your request</Trans>
        </Card.Title>

        <Card.Description>
          <Trans>Close it once you have been helped, or cancel it if you no longer need help.</Trans>
        </Card.Description>
      </Card.Header>

      <Card.Footer>
        <FulfilRequestDialog request={request} />

        <LinkButton
          Link={Link}
          href={routes.editRequest(request.id)}
          variant="secondary"
          icon="edit"
          className="grow"
        >
          <Trans>Edit</Trans>
        </LinkButton>

        <CancelRequestDialog request={request} />
      </Card.Footer>
    </Card.Root>
  );
}

function FulfilRequestDialog({ request }: { request: Request }) {
  const { t } = useLingui();

  const mutation = useMutation(
    changeRequestMutation(request.id, 'fulfil', {
      success: t`Request closed`,
      error: t`The request could not be closed`,
    }),
  );

  return (
    <Dialog.Root alert>
      <Dialog.Trigger>
        <Button icon="check" className="w-full">
          <Trans>Close the request</Trans>
        </Button>
      </Dialog.Trigger>

      <Dialog.Content closeLabel={t`Close`}>
        <Dialog.Header>
          <Dialog.Title>
            <Trans>Close the request “{request.title}”?</Trans>
          </Dialog.Title>
          <Dialog.Description>
            <Trans>
              Members will no longer be able to answer it. Those who offered help or commented will be
              notified.
            </Trans>
          </Dialog.Description>
        </Dialog.Header>

        {!request.hasTransactions && (
          <Dialog.Body>
            <Alert.Root tone="info">
              <Alert.Title>
                <Trans>You have not sent any {<Unit plural />} for this request</Trans>
              </Alert.Title>
              <Alert.Description>
                <Trans>You can still send them after closing it.</Trans>
              </Alert.Description>
            </Alert.Root>
          </Dialog.Body>
        )}

        <Dialog.Footer>
          <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>
            <Trans>Close the request</Trans>
          </Button>
          <Dialog.Close>
            <Button variant="secondary">
              <Trans>Back</Trans>
            </Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function CancelRequestDialog({ request }: { request: Request }) {
  const { t } = useLingui();

  const mutation = useMutation(
    changeRequestMutation(request.id, 'cancel', {
      success: t`Request canceled`,
      error: t`The request could not be canceled`,
    }),
  );

  return (
    <Dialog.Root alert>
      <Dialog.Trigger>
        <Button variant="ghost" className="grow">
          <Trans>Cancel the request</Trans>
        </Button>
      </Dialog.Trigger>

      <Dialog.Content closeLabel={t`Close`}>
        <Dialog.Header>
          <Dialog.Title>
            <Trans>Cancel the request “{request.title}”?</Trans>
          </Dialog.Title>
          <Dialog.Description>
            <Trans>
              Members will no longer be able to answer it. Those who offered help or commented will be
              notified.
            </Trans>
          </Dialog.Description>
        </Dialog.Header>

        <Dialog.Footer>
          <Button variant="danger" loading={mutation.isPending} onClick={() => mutation.mutate()}>
            <Trans>Cancel the request</Trans>
          </Button>
          <Dialog.Close>
            <Button variant="secondary">
              <Trans>Back</Trans>
            </Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function changeRequestMutation(
  requestId: string,
  action: 'fulfil' | 'cancel',
  messages: { success: string; error: string },
) {
  return mutationOptions({
    mutationFn: () => api('PUT', `/requests/${requestId}/${action}`),
    onSuccess: async (_data, _variables, _result, { client }) => {
      await client.invalidateQueries(queries.request(requestId));
      showToast(messages.success);
    },
    onError: () => showToast(messages.error, 'error'),
  });
}

type Answer = RequestAnswer['answer'] | null;

function AnswerCard({ request, memberId }: { request: Request; memberId: string }) {
  const { firstName } = request.requester;
  const answer = request.answers.find((answer) => answer.member.id === memberId)?.answer;

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (answer: Answer) => {
      return api('POST', `/requests/${request.id}/answer`, { body: { answer } });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(queries.request(request.id));
    },
  });

  const pending = (value: Answer) => mutation.isPending && mutation.variables === value;

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level={2}>
          {answer === undefined && <Trans>Can you help?</Trans>}
          {answer === 'positive' && <Trans>You can help</Trans>}
          {answer === 'negative' && <Trans>You can't help</Trans>}
        </Card.Title>

        <Card.Description>
          {answer === undefined && <Trans>{firstName} will be notified of your answer.</Trans>}
          {answer === 'positive' && <Trans>Contact {firstName} to arrange the details.</Trans>}
          {answer === 'negative' && <Trans>{firstName} knows you are not available.</Trans>}
        </Card.Description>
      </Card.Header>

      {mutation.isError && (
        <Card.Body>
          <ApiFailed title={<Trans>Your answer could not be saved</Trans>} />
        </Card.Body>
      )}

      <Card.Footer>
        {answer === undefined && (
          <>
            <Button
              icon="check"
              loading={pending('positive')}
              disabled={mutation.isPending}
              onClick={() => mutation.mutate('positive')}
              className="grow"
            >
              <Trans>I can help</Trans>
            </Button>

            <Button
              variant="secondary"
              loading={pending('negative')}
              disabled={mutation.isPending}
              onClick={() => mutation.mutate('negative')}
              className="grow"
            >
              <Trans>I can't</Trans>
            </Button>
          </>
        )}

        {answer !== undefined && (
          <Button variant="ghost" loading={pending(null)} onClick={() => mutation.mutate(null)}>
            <Trans>Withdraw my answer</Trans>
          </Button>
        )}
      </Card.Footer>
    </Card.Root>
  );
}

function Answers({ answers }: { answers: RequestAnswer[] }) {
  const sorted = answers.toSorted(
    (a, b) => Number(b.answer === 'positive') - Number(a.answer === 'positive'),
  );

  return (
    <section className="stack gap-3">
      <h2 className="text-title-3">
        <Trans>Answers</Trans>
      </h2>

      {answers.length === 0 && (
        <p className="text-body-sm text-muted">
          <Trans>No one has answered yet.</Trans>
        </p>
      )}

      {answers.length > 0 && (
        <Card.Root>
          <AnswersList answers={sorted} />
        </Card.Root>
      )}
    </section>
  );
}

function AnswersList({ answers }: { answers: RequestAnswer[] }) {
  return (
    <ul className="divide-y">
      {answers.map(({ id, member, answer }) => (
        <li key={id} className="row items-center gap-3 px-4 py-3">
          <MemberAvatar member={member} size="sm" decorative />

          <div className="stack min-w-0 flex-1">
            <p className="truncate text-body-sm">{formatMemberName(member)}</p>

            {answer === 'positive' ? (
              <p className="row items-center gap-1 text-caption text-success">
                <Icon name="check" size="sm" />
                <Trans>Can help</Trans>
              </p>
            ) : (
              <p className="text-caption text-subtle">
                <Trans>Can't help</Trans>
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Comments({ requestId }: { requestId: string }) {
  const query = useQuery(queries.comments('request', requestId));
  const commentsCount = query.data?.length ?? 0;

  return (
    <section className="stack gap-3">
      <h2 className="text-title-3">
        {commentsCount > 0 ? (
          <Plural value={commentsCount} one="# comment" other="# comments" />
        ) : (
          <Trans>Comments</Trans>
        )}
      </h2>

      <QueryResult
        query={query}
        failed={
          <ApiFailed
            title={<Trans>Unable to load the comments</Trans>}
            retrying={query.isFetching}
            retry={() => void query.refetch()}
          />
        }
        loading={<CommentsSkeleton />}
        empty={
          <p className="text-body-sm text-muted">
            <Trans>No comments yet.</Trans>
          </p>
        }
      >
        {(comments) => (
          <Card.Root>
            <CommentsList comments={comments} />
          </Card.Root>
        )}
      </QueryResult>
    </section>
  );
}

function CommentsList({ comments }: { comments: Comment[] }) {
  return (
    <ul>
      {comments.map((comment) => (
        <ListItem.Root key={comment.id}>
          <MemberAvatar member={comment.author} size="sm" decorative className="self-start" />

          <ListItem.Content>
            <ListItem.Header>
              <ListItem.Title className="text-body-strong">{formatMemberName(comment.author)}</ListItem.Title>
              <RelativeDate date={comment.date} className="text-caption text-subtle" />
            </ListItem.Header>

            <MessageContent message={comment.message} />
          </ListItem.Content>
        </ListItem.Root>
      ))}
    </ul>
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

function CommentsSkeleton() {
  return (
    <Card.Root aria-busy>
      <ul>
        {Array.from({ length: 2 }, (_, index) => (
          <li key={index} className="row items-start gap-3 p-4 not-last:border-b md:px-6">
            <Skeleton variant="circle" size="sm" />
            <div className="stack flex-1 gap-2">
              <Skeleton className="w-1/3" />
              <Skeleton />
            </div>
          </li>
        ))}
      </ul>
    </Card.Root>
  );
}

function RequestNotFound() {
  return (
    <EmptyState.Root icon="request">
      <EmptyState.Title level={1}>
        <Trans>Request not found</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>The link may be wrong, or the request may no longer exist.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <LinkButton Link={Link} href={routes.requests()} variant="secondary">
          <Trans>See the requests</Trans>
        </LinkButton>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}

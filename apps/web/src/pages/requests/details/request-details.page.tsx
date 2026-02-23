import { useParams } from '@solidjs/router';
import { useQuery } from '@tanstack/solid-query';

import { ApiError } from 'src/application/api';
import { apiQuery } from 'src/application/query';
import { Comments } from 'src/components/comments';
import { ErrorFallback } from 'src/components/error-boundary';
import { Query, QueryError } from 'src/components/query';
import { BoxSkeleton, TextSkeleton } from 'src/components/skeleton';

import { RequestAnswer } from './sections/request-answer';
import { RequestAnswerList } from './sections/request-answer-list';
import { RequestAuthor } from './sections/request-author';
import { RequestDescription } from './sections/request-description';
import { RequestHeader } from './sections/request-header';
import { RequestTransaction } from './sections/request-transaction';

export function RequestDetailsPage() {
  const params = useParams<{ requestId: string }>();
  const query = useQuery(() => apiQuery('getRequest', { path: { requestId: params.requestId } }));

  const error = (error: Error) => {
    if (ApiError.is(error) && error.status === 404) {
      return <ErrorFallback error={error} class="my-32" />;
    }

    return <QueryError error={error} />;
  };

  return (
    <Query query={query} pending={<Skeleton />} error={error}>
      {(request) => (
        <div class="grid gap-x-8 gap-y-12 lg:grid-cols-3">
          <div class="lg:col-span-3">
            <RequestHeader request={request()} />
          </div>

          <div class="col gap-12 lg:col-span-2">
            <RequestDescription request={request()} />
            <RequestAnswer request={request()} />
            <Comments entityType="request" entityId={request().id} />
          </div>

          <div class="col max-w-lg gap-12">
            <RequestAuthor request={request()} />
            <RequestTransaction request={request()} />
            <RequestAnswerList request={request()} />
          </div>
        </div>
      )}
    </Query>
  );
}

function Skeleton() {
  return (
    <div class="grid gap-x-8 gap-y-12 lg:grid-cols-3">
      <div class="lg:col-span-3">
        <TextSkeleton width={32} class="text-xl lg:text-3xl" />
      </div>

      <div class="col gap-12 lg:col-span-2">
        <BoxSkeleton height={24} />
      </div>

      <div class="col max-w-lg gap-12">
        <BoxSkeleton height={16} />
      </div>
    </div>
  );
}

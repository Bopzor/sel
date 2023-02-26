import { useQuery } from '../../../../app/api.context';
import { BackLink } from '../../../../app/components/back-link';
import { FallbackSpinner } from '../../../../app/components/fallback';
import { Show } from '../../../../app/components/show';
import { Translation } from '../../../../app/i18n.context';
import { useRouteParam } from '../../../../renderer/page-context';
import { Request } from '../../aliases';
import { RequestCard } from '../../components/request-card';
import { GetRequestHandler } from '../../use-cases/get-request/get-request';

const T = Translation.create('requests');

export const Page = () => {
  const requestId = useRouteParam('requestId');
  const [request] = useQuery(GetRequestHandler, { id: requestId });

  return (
    <>
      <BackLink href="/demandes" />

      <Show when={request} fallback={<FallbackSpinner />}>
        {(request) => <RequestComponent request={request} />}
      </Show>

      <a href={`/demandes/${requestId}/éditer`}>
        <T>Edit</T>
      </a>
    </>
  );
};

type RequestComponentProps = {
  request: Request;
};

const RequestComponent = ({ request }: RequestComponentProps) => {
  return <RequestCard request={request} clampDescription />;
};

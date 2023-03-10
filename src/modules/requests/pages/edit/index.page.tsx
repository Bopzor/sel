import { navigate } from 'vite-plugin-ssr/client/router';

import { BackLink } from '../../../../app/components/back-link';
import { FallbackSpinner } from '../../../../app/components/fallback';
import { Show } from '../../../../app/components/show';
import { FRONT_TOKENS } from '../../../../app/front-tokens';
import { useMutation } from '../../../../app/hooks/use-mutation';
import { useQuery } from '../../../../app/hooks/use-query';
import { Translation } from '../../../../app/i18n.context';
import { useRouteParam } from '../../../../renderer/page-context';
import { TOKENS } from '../../../../tokens';
import { RequestForm, RequestFormShape } from '../../components/request-form';

const T = Translation.create('requests');

export const Page = () => {
  const requestId = useRouteParam('requestId');
  const [request] = useQuery(FRONT_TOKENS.requestsService, 'getRequest', requestId);

  const editRequest = useMutation(TOKENS.editRequestHandler);

  const onSubmit = async ({ title, description }: RequestFormShape) => {
    await editRequest({
      id: requestId,
      title,
      description,
    });

    await navigate(`/demandes/${requestId}`);
  };

  return (
    <>
      <BackLink href="/demandes" />
      <h2 className="text-xl font-bold">{<T>Edit a request</T>}</h2>
      <Show when={request} fallback={<FallbackSpinner />}>
        <RequestForm initialValues={request} submitButtonLabel={<T>Update</T>} onSubmit={onSubmit} />
      </Show>
    </>
  );
};

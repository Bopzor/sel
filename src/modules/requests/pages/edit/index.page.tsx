import { navigate } from 'vite-plugin-ssr/client/router';

import { useExecuteCommand, useQuery } from '../../../../app/api.context';
import { BackLink } from '../../../../app/components/back-link';
import { FallbackSpinner } from '../../../../app/components/fallback';
import { Show } from '../../../../app/components/show';
import { Translation } from '../../../../app/i18n.context';
import { useRouteParam } from '../../../../renderer/page-context';
import { RequestForm, RequestFormShape } from '../../components/request-form';
import { EditRequestHandler } from '../../use-cases/edit-request/edit-request';
import { GetRequestHandler } from '../../use-cases/get-request/get-request';

const T = Translation.create('requests');

export const Page = () => {
  const requestId = useRouteParam('requestId');
  const [request] = useQuery(GetRequestHandler, { id: requestId });

  const editRequest = useExecuteCommand(EditRequestHandler);

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

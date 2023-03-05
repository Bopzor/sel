import { navigate } from 'vite-plugin-ssr/client/router';

import { BackLink } from '../../../../app/components/back-link';
import { FallbackSpinner } from '../../../../app/components/fallback';
import { Show } from '../../../../app/components/show';
import { useExecuteCommand } from '../../../../app/hooks/use-execute-command';
import { useQuery } from '../../../../app/hooks/use-query';
import { Translation } from '../../../../app/i18n.context';
import { useRouteParam } from '../../../../renderer/page-context';
import { TOKENS } from '../../../../tokens';
import { RequestForm, RequestFormShape } from '../../components/request-form';

const T = Translation.create('requests');

export const Page = () => {
  const requestId = useRouteParam('requestId');
  const [request] = useQuery(TOKENS.getRequestHandler, { id: requestId });

  const editRequest = useExecuteCommand(TOKENS.editRequestHandler);

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

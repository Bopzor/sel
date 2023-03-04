import { navigate } from 'vite-plugin-ssr/client/router';

import { useExecuteCommand } from '../../../../app/api.context';
import { BackLink } from '../../../../app/components/back-link';
import { Translation } from '../../../../app/i18n.context';
import { createId } from '../../../../common/create-id';
import { RequestForm } from '../../components/request-form';
import { CreateRequestHandler } from '../../use-cases/create-request/create-request';

const T = Translation.create('requests');

type RequestFormShape = {
  title: string;
  description: string;
};

export const Page = () => {
  const createRequest = useExecuteCommand(CreateRequestHandler);

  const onSubmit = async ({ title, description }: RequestFormShape) => {
    const id = createId();

    await createRequest({
      id,
      requesterId: 'nils',
      title,
      description,
    });

    await navigate(`/demandes/${id}`);
  };

  return (
    <>
      <BackLink href="/demandes" />
      <h2 className="text-xl font-bold">{<T>Create a request</T>}</h2>
      <RequestForm submitButtonLabel={<T>Publish</T>} onSubmit={onSubmit} />
    </>
  );
};

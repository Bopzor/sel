import { navigate } from 'vite-plugin-ssr/client/router';

import { BackLink } from '../../../../app/components/back-link';
import { useMutation } from '../../../../app/hooks/use-mutation';
import { Translation } from '../../../../app/i18n.context';
import { createId } from '../../../../common/create-id';
import { TOKENS } from '../../../../tokens';
import { RequestForm } from '../../components/request-form';

const T = Translation.create('requests');

type RequestFormShape = {
  title: string;
  description: string;
};

export const Page = () => {
  const createRequest = useMutation(TOKENS.createRequestHandler);

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

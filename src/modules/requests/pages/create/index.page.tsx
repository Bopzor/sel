import { navigate } from 'vite-plugin-ssr/client/router';

import { BackLink } from '../../../../app/components/back-link';
import { FRONT_TOKENS } from '../../../../app/front-tokens';
import { useMutation } from '../../../../app/hooks/use-mutation';
import { Translation } from '../../../../app/i18n.context';
import { createId } from '../../../../common/create-id';
import { RequestForm } from '../../components/request-form';

const T = Translation.create('requests');

type RequestFormShape = {
  title: string;
  description: string;
};

export const Page = () => {
  const [createRequest] = useMutation(FRONT_TOKENS.requestsService, 'createRequest');

  const onSubmit = async ({ title, description }: RequestFormShape) => {
    const id = createId();

    await createRequest({
      id,
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

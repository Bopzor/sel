import { useForm } from 'react-hook-form';
import { navigate } from 'vite-plugin-ssr/client/router';

import { useExecuteCommand } from '../../../../app/api.context';
import { BackLink } from '../../../../app/components/back-link';
import { Button } from '../../../../app/components/button';
import { FormControl } from '../../../../app/components/form-control';
import { Input } from '../../../../app/components/input';
import { Translation, useTranslate } from '../../../../app/i18n.context';
import { createId } from '../../../../common/create-id';
import { CreateRequestHandler } from '../../use-cases/create-request/create-request';

const T = Translation.create('requests');

type RequestFormShape = {
  title: string;
  description: string;
};

export const Page = () => {
  const t = useTranslate('requests');
  const { register, handleSubmit, formState } = useForm<RequestFormShape>();
  const createRequest = useExecuteCommand(CreateRequestHandler);

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

      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form className="col gap-2" onSubmit={handleSubmit(onSubmit)}>
        <FormControl label={<T>Request title</T>}>
          <Input
            placeholder={t('Example: Climbing equipment loan')}
            {...register('title', { required: true })}
          />
        </FormControl>

        <FormControl label={<T>Description</T>}>
          <textarea
            placeholder={t('I am looking for...')}
            className="resize-y rounded p-1 outline-none focus:shadow"
            rows={4}
            {...register('description', { required: true })}
          />
        </FormControl>

        <Button type="submit" loading={formState.isSubmitting} className="self-start">
          {t('Publish')}
        </Button>
      </form>
    </>
  );
};

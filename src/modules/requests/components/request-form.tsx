import { useForm } from 'react-hook-form';

import { Button } from '../../../app/components/button';
import { FormControl } from '../../../app/components/form-control';
import { Input } from '../../../app/components/input';
import { Translation, useTranslate } from '../../../app/i18n.context';

const T = Translation.create('requests');

export type RequestFormShape = {
  title: string;
  description: string;
};

type RequestFormProps = {
  initialValues?: RequestFormShape;
  submitButtonLabel: React.ReactNode;
  onSubmit: (values: RequestFormShape) => Promise<void>;
};

export const RequestForm = ({ initialValues, submitButtonLabel, onSubmit }: RequestFormProps) => {
  const t = useTranslate('requests');

  const { register, handleSubmit, formState } = useForm<RequestFormShape>({
    defaultValues: initialValues,
  });

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
        {submitButtonLabel}
      </Button>
    </form>
  );
};

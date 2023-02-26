import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import { Button } from '../../../app/components/button';
import { FormControl } from '../../../app/components/form-control';
import { Input } from '../../../app/components/input';
import { Translation, useTranslate } from '../../../app/i18n.context';

const requestFormSchema = yup.object({
  title: yup.string().required(),
  description: yup.string().required(),
});

export type RequestFormShape = yup.InferType<typeof requestFormSchema>;

const T = Translation.create('requests');

type RequestFormProps = {
  initialValues?: RequestFormShape;
  submitButtonLabel: React.ReactNode;
  onSubmit: (values: RequestFormShape) => Promise<void>;
};

export const RequestForm = ({ initialValues, submitButtonLabel, onSubmit }: RequestFormProps) => {
  const t = useTranslate('requests');

  const { register, handleSubmit, formState } = useForm<RequestFormShape>({
    defaultValues: initialValues,
    resolver: yupResolver(requestFormSchema),
  });

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <form className="col gap-2" onSubmit={handleSubmit(onSubmit)}>
      <FormControl
        label={<T>Request title</T>}
        errorLabel={t('requestForm.title')}
        error={formState.errors.title}
      >
        <Input placeholder={t('Example: Climbing equipment loan')} {...register('title')} />
      </FormControl>

      <FormControl
        label={<T>Description</T>}
        errorLabel={t('requestForm.description')}
        error={formState.errors.description}
      >
        <textarea
          placeholder={t('I am looking for...')}
          className="resize-y rounded p-1 outline-none focus:shadow"
          rows={4}
          {...register('description')}
        />
      </FormControl>

      <Button type="submit" loading={formState.isSubmitting} className="self-start">
        {submitButtonLabel}
      </Button>
    </form>
  );
};

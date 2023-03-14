import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { Button } from '../../../app/components/button';
import { Editor } from '../../../app/components/editor';
import { FormControl } from '../../../app/components/form-control';
import { Input } from '../../../app/components/input';
import { Translation, useTranslate } from '../../../app/i18n.context';
import { yup } from '../../../common/yup';

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

  const { register, setValue, handleSubmit, formState } = useForm<RequestFormShape>({
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
        <Editor
          initialHtml={initialValues?.description}
          placeholder={t('requests')}
          onChange={(html) => setValue('description', html)}
        />
      </FormControl>

      <Button type="submit" loading={formState.isSubmitting} className="self-start">
        {submitButtonLabel}
      </Button>
    </form>
  );
};

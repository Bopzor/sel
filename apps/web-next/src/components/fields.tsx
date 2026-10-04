import { Alert, FormField, Input, RichTextEditor } from '@sel/ui';
import { noop, type UseMutationResult } from '@tanstack/react-query';
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type GlobalError,
  type UseFormReturn,
} from 'react-hook-form';

type FieldProps<Values extends FieldValues, Transformed> = {
  control: Control<Values, unknown, Transformed>;
  name: FieldPath<Values>;
  label: React.ReactNode;
  hint?: React.ReactNode;
};

export function submitWithMutation<TFieldValues extends FieldValues, TTransformedValues>(
  form: UseFormReturn<TFieldValues, unknown, TTransformedValues>,
  mutation: UseMutationResult<unknown, Error, TTransformedValues>,
): React.EventHandler<React.SyntheticEvent> {
  // The mutation's onError handles the failure; handleSubmit would rethrow it as an unhandled rejection.
  const submit = form.handleSubmit((body) => mutation.mutateAsync(body).catch(noop));

  return (event) => {
    void submit(event);
  };
}

type InputFieldProps<Values extends FieldValues, Transformed> = FieldProps<Values, Transformed> &
  Omit<React.ComponentProps<typeof Input>, 'name' | 'value' | 'defaultValue' | 'onBlur' | 'ref'>;

export function InputField<Values extends FieldValues, Transformed>({
  control,
  name,
  label,
  hint,
  onChange,
  ...props
}: InputFieldProps<Values, Transformed>) {
  const { field, fieldState } = useController({ control, name });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    field.onChange(event);
    onChange?.(event);
  };

  return (
    <FormField label={label} hint={hint} error={fieldState.error?.message}>
      <Input {...props} {...field} onChange={handleChange} />
    </FormField>
  );
}

type RichTextFieldProps<Values extends FieldValues, Transformed> = FieldProps<Values, Transformed> & {
  placeholder?: string;
  toolbar: React.ReactNode;
};

export function RichTextField<Values extends FieldValues, Transformed>({
  control,
  name,
  label,
  hint,
  placeholder,
  toolbar,
}: RichTextFieldProps<Values, Transformed>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <FormField label={label} hint={hint} error={fieldState.error?.message}>
      <RichTextEditor.Root {...field} placeholder={placeholder}>
        <RichTextEditor.Textarea toolbar={toolbar} />
      </RichTextEditor.Root>
    </FormField>
  );
}

type FormServerErrorAlertProps = {
  error?: GlobalError;
  title: React.ReactNode;
};

export function FormServerErrorAlert({ error, title }: FormServerErrorAlertProps) {
  if (error?.type !== 'server') {
    return null;
  }

  return (
    <Alert.Root tone="danger">
      <Alert.Title>{title}</Alert.Title>
      <Alert.Description>{error.message}</Alert.Description>
    </Alert.Root>
  );
}

import { Alert, Checkbox, FormField, Input, RichTextEditor, TextArea } from '@sel/ui';
import type { Override } from '@sel/utils';
import { noop, type UseMutationResult } from '@tanstack/react-query';
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type GlobalError,
  type UseFormReturn,
} from 'react-hook-form';

type ControlledProps = 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'ref';

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

type InputFieldProps<Values extends FieldValues, Transformed> = Override<
  Omit<React.ComponentProps<typeof Input>, Exclude<ControlledProps, 'onChange'>>,
  FieldProps<Values, Transformed>
>;

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

type TextAreaFieldProps<Values extends FieldValues, Transformed> = Override<
  Omit<React.ComponentProps<typeof TextArea>, ControlledProps>,
  FieldProps<Values, Transformed>
>;

export function TextAreaField<Values extends FieldValues, Transformed>({
  control,
  name,
  label,
  hint,
  ...props
}: TextAreaFieldProps<Values, Transformed>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <FormField label={label} hint={hint} error={fieldState.error?.message}>
      <TextArea {...props} {...field} />
    </FormField>
  );
}

type CheckboxFieldProps<Values extends FieldValues, Transformed> = Override<
  Omit<React.ComponentProps<typeof Checkbox>, ControlledProps | 'checked' | 'defaultChecked'>,
  Omit<FieldProps<Values, Transformed>, 'hint'>
>;

export function CheckboxField<Values extends FieldValues, Transformed>({
  control,
  name,
  ...props
}: CheckboxFieldProps<Values, Transformed>) {
  const {
    field: { value, onChange, ...field },
  } = useController({ control, name });

  return (
    <Checkbox
      {...props}
      {...field}
      checked={Boolean(value)}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
}

type RichTextFieldProps<Values extends FieldValues, Transformed> = Override<
  Omit<React.ComponentProps<typeof RichTextEditor.Root>, ControlledProps | 'children'>,
  FieldProps<Values, Transformed>
> & {
  toolbar: React.ReactNode;
};

export function RichTextField<Values extends FieldValues, Transformed>({
  control,
  name,
  label,
  hint,
  toolbar,
  ...props
}: RichTextFieldProps<Values, Transformed>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <FormField label={label} hint={hint} error={fieldState.error?.message}>
      <RichTextEditor.Root {...props} {...field}>
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

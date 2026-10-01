import { Field, Input } from '@sel/ui';
import type { ChangeEvent, ComponentProps, ReactNode } from 'react';
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

type FieldProps<Values extends FieldValues, Transformed> = {
  control: Control<Values, unknown, Transformed>;
  name: FieldPath<Values>;
  label: ReactNode;
  hint?: ReactNode;
};

type InputFieldProps<Values extends FieldValues, Transformed> = FieldProps<Values, Transformed> &
  Omit<ComponentProps<typeof Input>, 'name' | 'value' | 'defaultValue' | 'onBlur' | 'ref'>;

export function InputField<Values extends FieldValues, Transformed>({
  control,
  name,
  label,
  hint,
  onChange,
  ...props
}: InputFieldProps<Values, Transformed>) {
  const { field, fieldState } = useController({ control, name });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    field.onChange(event);
    onChange?.(event);
  };

  return (
    <Field label={label} hint={hint} error={fieldState.error?.message}>
      <Input {...props} {...field} onChange={handleChange} />
    </Field>
  );
}

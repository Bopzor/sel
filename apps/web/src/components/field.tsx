import clsx from 'clsx';
import { ComponentProps, splitProps } from 'solid-js';

export type FieldVariant = 'solid' | 'outlined';
export type FieldWidth = 'small' | 'medium' | 'full';

type FieldProps = ComponentProps<'div'> & {
  variant?: FieldVariant;
  width?: FieldWidth;
};

export function Field(props1: FieldProps) {
  const [fieldProps, props] = splitProps(props1, ['variant', 'width', 'class', 'classList']);

  return (
    <div
      class={clsx(
        'row h-12 min-h-12 w-full items-center overflow-hidden rounded-lg border-2',
        'transition-colors focus-within:border-primary/50',
        fieldProps.class,
      )}
      classList={{
        'max-w-64': fieldProps.width === 'small',
        'max-w-md': fieldProps.width === 'medium',
        'border-transparent bg-neutral shadow': fieldProps.variant === 'solid',
        'border-inverted/20': fieldProps.variant === 'outlined',
        ...fieldProps.classList,
      }}
      {...props}
    />
  );
}

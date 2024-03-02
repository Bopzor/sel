import clsx from 'clsx';
import { JSX } from 'solid-js';

export type FieldVariant = 'solid' | 'outlined';
export type FieldWidth = 'small' | 'medium' | 'full';

type FieldProps = {
  variant?: FieldVariant;
  width?: FieldWidth;
  class?: string;
  children: JSX.Element;
};

export function Field(props: FieldProps) {
  return (
    <div
      class={clsx(
        'row w-full items-center overflow-hidden rounded-lg border-2',
        'transition-colors focus-within:border-primary/50',
        props.class,
      )}
      classList={{
        'max-w-64': props.width === 'small',
        'max-w-md': props.width === 'medium',
        'border-transparent bg-neutral shadow': props.variant === 'solid',
        'border-inverted/20': props.variant === 'outlined',
      }}
    >
      {props.children}
    </div>
  );
}

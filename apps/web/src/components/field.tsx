import { VariantProps, cva } from 'cva';

type FieldProps = VariantProps<typeof field>;
export type FieldVariant = FieldProps['variant'];

export const field = cva(
  [
    'row h-12 min-h-12 w-full items-center overflow-hidden rounded-lg border-2',
    'transition-colors focus-within:border-primary/50',
  ],
  {
    variants: {
      variant: {
        solid: 'border-transparent bg-neutral shadow-sm',
        outlined: 'border-inverted/20',
      },
    },
    defaultVariants: {
      variant: 'solid',
    },
  },
);

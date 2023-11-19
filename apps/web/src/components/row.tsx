import clsx from 'clsx';
import { ComponentProps } from 'solid-js';

type RowProps = ComponentProps<'div'> & {
  gap?: 1 | 2 | 3 | 4;
};

export const Row = (props: RowProps) => (
  <div
    {...props}
    class={clsx(props.class, 'row items-center')}
    classList={{
      'gap-1': props.gap === 1,
      'gap-2': props.gap === 2,
      'gap-3': props.gap === 3,
      'gap-4': props.gap === 4,
      ...props.classList,
    }}
  />
);

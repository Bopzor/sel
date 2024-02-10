import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { arrowRight } from 'solid-heroicons/outline';
import { ComponentProps } from 'solid-js';

import { Button } from '../../../components/button';

type NextButtonProps = ComponentProps<typeof Button>;

export function NextButton(props: NextButtonProps) {
  return (
    <Button type="submit" class={clsx('row mt-4 items-center self-start', props.class)} {...props}>
      {props.children} <Icon path={arrowRight} class="h-em" stroke-width={3} />
    </Button>
  );
}

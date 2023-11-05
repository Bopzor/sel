import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { arrowRight } from 'solid-heroicons/outline';
import { Component, ComponentProps } from 'solid-js';

import { Button } from '../../components/button';

type NextButtonProps = ComponentProps<typeof Button>;

export const NextButton: Component<NextButtonProps> = (props) => {
  return (
    <Button class={clsx('row mt-4 items-center self-start', props.class)} {...props}>
      {props.children} <Icon path={arrowRight} class="h-em" stroke-width={3} />
    </Button>
  );
};

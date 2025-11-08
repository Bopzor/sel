import { ResourceType } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { calendar, chatBubbleBottomCenterText, handRaised } from 'solid-heroicons/solid';
import { ComponentProps, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export function ResourceIcon(props: Omit<ComponentProps<typeof Icon>, 'path'> & { type: ResourceType }) {
  const [typeProps, iconProps] = splitProps(props, ['type']);

  const iconMap = {
    request: handRaised,
    event: calendar,
    information: chatBubbleBottomCenterText,
  };

  return <Dynamic component={Icon} path={iconMap[typeProps.type]} {...iconProps} />;
}

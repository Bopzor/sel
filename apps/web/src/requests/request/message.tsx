import { Request } from '@sel/shared';

import { RichText } from '../../components/rich-text';

type MessageProps = {
  request?: Request;
};

export function Message(props: MessageProps) {
  return <RichText class="rounded-lg bg-neutral p-8 shadow">{props.request?.message}</RichText>;
}

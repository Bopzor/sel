import { Request } from '@sel/shared';

type MessageProps = {
  request?: Request;
};

export function Message(props: MessageProps) {
  return (
    <div
      class="prose max-w-none rounded-lg bg-neutral p-8 shadow"
      // eslint-disable-next-line solid/no-innerhtml
      innerHTML={props.request?.message}
    />
  );
}

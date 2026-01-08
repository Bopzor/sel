import { Event } from '@sel/shared';

import { card } from 'src/components/card';
import { Message } from 'src/components/message';

export function EventDescription(props: { event: Event }) {
  return (
    <section>
      <div class={card.header({ class: 'text-xl max-lg:hidden' })}>&nbsp;</div>
      <Message message={props.event.message} class={card.content()} />
    </section>
  );
}

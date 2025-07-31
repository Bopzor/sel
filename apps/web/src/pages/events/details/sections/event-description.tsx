import { Event } from '@sel/shared';

import { Card } from 'src/components/card';
import { Message } from 'src/components/message';

export function EventDescription(props: { event: Event }) {
  return (
    <Card>
      <Message message={props.event.message} />
    </Card>
  );
}

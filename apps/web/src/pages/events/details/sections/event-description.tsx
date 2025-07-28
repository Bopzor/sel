import { Event } from '@sel/shared';

import { Card } from 'src/components/card';
import { RichText } from 'src/components/rich-text';

export function EventDescription(props: { event: Event }) {
  return (
    <Card>
      <RichText>{props.event.message.body}</RichText>
    </Card>
  );
}

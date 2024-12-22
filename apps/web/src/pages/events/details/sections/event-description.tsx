import { Event } from '@sel/shared';

import { Card } from 'src/components/card';
import { RichText } from 'src/components/rich-text';

export function EventDescription(props: { event: Event }) {
  return (
    <Card class="lg:p-8">
      <RichText>{props.event.body}</RichText>
    </Card>
  );
}

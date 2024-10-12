import { Event } from '@sel/shared';

import { CommentsSection } from '../../../../components/comments-section';
import { container } from '../../../../infrastructure/container';
import { Translate } from '../../../../intl/translate';
import { TOKENS } from '../../../../tokens';

const T = Translate.prefix('events.details');

export function EventComments(props: { event: Event; onCreated: () => void }) {
  const api = container.resolve(TOKENS.api);

  return (
    <div>
      <h2 class="mb-4">
        <T id="commentsTitle" />
      </h2>

      <CommentsSection
        comments={props.event.comments}
        onCreate={(html) =>
          api.createEventComment({
            path: { eventId: props.event.id },
            body: { body: html },
          })
        }
        onCreated={props.onCreated}
      />
    </div>
  );
}

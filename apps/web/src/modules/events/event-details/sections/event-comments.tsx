import { Event } from '@sel/shared';

import { CommentsSection } from '../../../../components/comments-section';
import { container } from '../../../../infrastructure/container';
import { Translate } from '../../../../intl/translate';
import { TOKENS } from '../../../../tokens';

const T = Translate.prefix('events.details');

export function EventComments(props: { event: Event; onCreated: () => void }) {
  const eventApi = container.resolve(TOKENS.eventApi);

  return (
    <div>
      <h2 class="mb-4">
        <T id="commentsTitle" />
      </h2>

      <CommentsSection
        comments={props.event.comments}
        onCreate={(html) => eventApi.createComment(props.event.id, html)}
        onCreated={props.onCreated}
      />
    </div>
  );
}

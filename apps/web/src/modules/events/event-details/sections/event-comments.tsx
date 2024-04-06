import { Event } from '@sel/shared';

import { CommentsSection } from '../../../../components/comments-section';
import { Translate } from '../../../../intl/translate';

const T = Translate.prefix('events.details');

export function EventComments(props: { event: Event; onCreated: () => void }) {
  return (
    <div>
      <h2 class="mb-4">
        <T id="commentsTitle" />
      </h2>

      <CommentsSection
        comments={[]}
        onCreate={() => {
          return Promise.resolve();
        }}
        onCreated={props.onCreated}
      />
    </div>
  );
}

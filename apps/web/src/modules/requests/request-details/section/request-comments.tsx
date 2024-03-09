import { Request } from '@sel/shared';

import { CommentsSection } from '../../../../components/comments-section';
import { container } from '../../../../infrastructure/container';
import { Translate } from '../../../../intl/translate';
import { TOKENS } from '../../../../tokens';

const T = Translate.prefix('requests.comments');

export function RequestComments(props: { request: Request; onCreated: () => void }) {
  const requestApi = container.resolve(TOKENS.requestApi);

  return (
    <div>
      <h2 class="mb-4">
        <T id="title" />
      </h2>

      <CommentsSection
        comments={props.request.comments}
        onCreate={(html) => requestApi.createComment(props.request.id, html)}
        onCreated={props.onCreated}
      />
    </div>
  );
}

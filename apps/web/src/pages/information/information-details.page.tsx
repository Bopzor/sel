import { useParams } from '@solidjs/router';
import { useQuery } from '@tanstack/solid-query';
import { Show } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { Card } from 'src/components/card';
import { Comments } from 'src/components/comments';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { Message } from 'src/components/message';

export function InformationDetailsPage() {
  const { informationId } = useParams<{ informationId: string }>();
  const query = useQuery(() => apiQuery('getInformation', { path: { informationId } }));

  return (
    <Show when={query.data}>
      {(information) => (
        <div class="col gap-8">
          <Card title={<MemberAvatarName member={query.data?.author} />}>
            <h1 class="mb-4 text-3xl">{query.data?.title}</h1>
            <Message message={query.data?.message} />
          </Card>

          <Comments type="information" entityId={information().id} />
        </div>
      )}
    </Show>
  );
}

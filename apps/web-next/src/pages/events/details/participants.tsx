import { Plural, Trans } from '@lingui/react/macro';
import type { EventParticipant } from '@sel/shared';
import { Card, ListItem } from '@sel/ui';

import { formatMemberName } from 'src/app/format';
import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';
import { MemberAvatar } from 'src/components/member-avatar';

export function Participants({ participants }: { participants: EventParticipant[] }) {
  const coming = participants.filter(({ participation }) => participation === 'yes');

  return (
    <section className="stack gap-3">
      <h2 className="text-title-3">
        {coming.length === 0 ? (
          <Trans>Participants</Trans>
        ) : (
          <Plural value={coming.length} one="# participant" other="# participants" />
        )}
      </h2>

      {coming.length === 0 && (
        <p className="text-body-sm text-muted">
          <Trans>No one has said they are coming yet.</Trans>
        </p>
      )}

      {coming.length > 0 && (
        <Card.Root>
          <ul>
            {coming.map((participant) => (
              <ListItem.Root key={participant.id}>
                <MemberAvatar member={participant} size="sm" decorative />

                <ListItem.Content>
                  <ListItem.Title className="text-body-sm font-medium">
                    <ListItem.Link Link={Link} href={routes.member(participant.id)}>
                      {formatMemberName(participant)}
                    </ListItem.Link>
                  </ListItem.Title>
                </ListItem.Content>
              </ListItem.Root>
            ))}
          </ul>
        </Card.Root>
      )}
    </section>
  );
}

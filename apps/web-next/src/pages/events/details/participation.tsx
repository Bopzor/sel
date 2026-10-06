import { Trans } from '@lingui/react/macro';
import type { Event, EventParticipation } from '@sel/shared';
import { Button, Card } from '@sel/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from 'src/app/api';
import { queries } from 'src/app/queries';
import { ApiFailed } from 'src/components/api-result';

type Participation = EventParticipation | null;

export function ParticipationCard({ event, memberId }: { event: Event; memberId: string }) {
  const queryClient = useQueryClient();

  const participation = event.participants.find((participant) => participant.id === memberId)?.participation;

  const mutation = useMutation({
    mutationFn: (participation: Participation) => {
      return api('PUT', `/events/${event.id}/participation`, { body: { participation } });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries(queries.event(event.id)),
      ]);
    },
  });

  const pending = (value: Participation) => mutation.isPending && mutation.variables === value;

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level={2}>
          {participation === undefined && <Trans>Are you coming?</Trans>}
          {participation === 'yes' && <Trans>You are coming</Trans>}
          {participation === 'no' && <Trans>You are not coming</Trans>}
        </Card.Title>

        <Card.Description>
          {participation === undefined && <Trans>The organizer will know who to expect.</Trans>}
          {participation === 'yes' && <Trans>You will be notified of the new comments.</Trans>}
          {participation === 'no' && <Trans>You can change your mind until the event.</Trans>}
        </Card.Description>
      </Card.Header>

      {mutation.isError && (
        <Card.Body>
          <ApiFailed title={<Trans>Your answer could not be saved</Trans>} />
        </Card.Body>
      )}

      <Card.Footer>
        {participation !== 'yes' && (
          <Button
            icon="check"
            loading={pending('yes')}
            disabled={mutation.isPending}
            onClick={() => mutation.mutate('yes')}
            className="grow"
          >
            {participation === 'no' ? <Trans>I'm coming after all</Trans> : <Trans>I'm coming</Trans>}
          </Button>
        )}

        {participation !== 'no' && (
          <Button
            variant="secondary"
            loading={pending('no')}
            disabled={mutation.isPending}
            onClick={() => mutation.mutate('no')}
            className="grow"
          >
            {participation === 'yes' ? <Trans>I can't come anymore</Trans> : <Trans>I'm not coming</Trans>}
          </Button>
        )}

        {participation !== undefined && (
          <Button
            variant="ghost"
            loading={pending(null)}
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(null)}
          >
            <Trans>Withdraw my answer</Trans>
          </Button>
        )}
      </Card.Footer>
    </Card.Root>
  );
}

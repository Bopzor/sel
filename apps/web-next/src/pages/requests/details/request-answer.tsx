import { Trans } from '@lingui/react/macro';
import type { Request, RequestAnswer } from '@sel/shared';
import { Button, Card } from '@sel/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from 'src/app/api';
import { queries } from 'src/app/queries';
import { ApiFailed } from 'src/components/api-result';

type Answer = RequestAnswer['answer'] | null;

export function RequestAnswerCard({ request, memberId }: { request: Request; memberId: string }) {
  const { firstName } = request.requester;
  const answer = request.answers.find((answer) => answer.member.id === memberId)?.answer;

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (answer: Answer) => {
      return api('POST', `/requests/${request.id}/answer`, { body: { answer } });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(queries.request(request.id));
    },
  });

  const pending = (value: Answer) => mutation.isPending && mutation.variables === value;

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level={2}>
          {answer === undefined && <Trans>Can you help?</Trans>}
          {answer === 'positive' && <Trans>You can help</Trans>}
          {answer === 'negative' && <Trans>You can't help</Trans>}
        </Card.Title>

        <Card.Description>
          {answer === undefined && <Trans>{firstName} will be notified of your answer.</Trans>}
          {answer === 'positive' && <Trans>Contact {firstName} to arrange the details.</Trans>}
          {answer === 'negative' && <Trans>{firstName} knows you are not available.</Trans>}
        </Card.Description>
      </Card.Header>

      {mutation.isError && (
        <Card.Body>
          <ApiFailed title={<Trans>Your answer could not be saved</Trans>} />
        </Card.Body>
      )}

      <Card.Footer>
        {answer === undefined && (
          <>
            <Button
              icon="check"
              loading={pending('positive')}
              disabled={mutation.isPending}
              onClick={() => mutation.mutate('positive')}
              className="grow"
            >
              <Trans>I can help</Trans>
            </Button>

            <Button
              variant="secondary"
              loading={pending('negative')}
              disabled={mutation.isPending}
              onClick={() => mutation.mutate('negative')}
              className="grow"
            >
              <Trans>I can't</Trans>
            </Button>
          </>
        )}

        {answer !== undefined && (
          <Button variant="ghost" loading={pending(null)} onClick={() => mutation.mutate(null)}>
            <Trans>Withdraw my answer</Trans>
          </Button>
        )}
      </Card.Footer>
    </Card.Root>
  );
}

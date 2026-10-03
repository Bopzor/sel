import { Trans, useLingui } from '@lingui/react/macro';
import { type Request } from '@sel/shared';
import { Alert, Button, Card, Dialog, LinkButton, showToast } from '@sel/ui';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import { api } from 'src/app/api';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';
import { Unit } from 'src/components/unit';

export function RequesterActionsCard({ request }: { request: Request }) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level={2}>
          <Trans>Your request</Trans>
        </Card.Title>

        <Card.Description>
          <Trans>Close it once you have been helped, or cancel it if you no longer need help.</Trans>
        </Card.Description>
      </Card.Header>

      <Card.Footer>
        <FulfilRequestDialog request={request} />

        <LinkButton
          Link={Link}
          href={routes.editRequest(request.id)}
          variant="secondary"
          icon="edit"
          className="grow"
        >
          <Trans>Edit</Trans>
        </LinkButton>

        <CancelRequestDialog request={request} />
      </Card.Footer>
    </Card.Root>
  );
}

function FulfilRequestDialog({ request }: { request: Request }) {
  const { t } = useLingui();

  const mutation = useMutation(
    changeRequestMutation(request.id, 'fulfil', {
      success: t`Request closed`,
      error: t`The request could not be closed`,
    }),
  );

  return (
    <Dialog.Root alert>
      <Dialog.Trigger>
        <Button icon="check" className="w-full">
          <Trans>Close the request</Trans>
        </Button>
      </Dialog.Trigger>

      <Dialog.Content closeLabel={t`Close`}>
        <Dialog.Header>
          <Dialog.Title>
            <Trans>Close the request “{request.title}”?</Trans>
          </Dialog.Title>
          <Dialog.Description>
            <Trans>
              Members will no longer be able to answer it. Those who offered help or commented will be
              notified.
            </Trans>
          </Dialog.Description>
        </Dialog.Header>

        {!request.hasTransactions && (
          <Dialog.Body>
            <Alert.Root tone="info">
              <Alert.Title>
                <Trans>You have not sent any {<Unit plural />} for this request</Trans>
              </Alert.Title>
              <Alert.Description>
                <Trans>You can still send them after closing it.</Trans>
              </Alert.Description>
            </Alert.Root>
          </Dialog.Body>
        )}

        <Dialog.Footer>
          <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>
            <Trans>Close the request</Trans>
          </Button>
          <Dialog.Close>
            <Button variant="secondary">
              <Trans>Back</Trans>
            </Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function CancelRequestDialog({ request }: { request: Request }) {
  const { t } = useLingui();

  const mutation = useMutation(
    changeRequestMutation(request.id, 'cancel', {
      success: t`Request canceled`,
      error: t`The request could not be canceled`,
    }),
  );

  return (
    <Dialog.Root alert>
      <Dialog.Trigger>
        <Button variant="ghost" className="grow">
          <Trans>Cancel the request</Trans>
        </Button>
      </Dialog.Trigger>

      <Dialog.Content closeLabel={t`Close`}>
        <Dialog.Header>
          <Dialog.Title>
            <Trans>Cancel the request “{request.title}”?</Trans>
          </Dialog.Title>
          <Dialog.Description>
            <Trans>
              Members will no longer be able to answer it. Those who offered help or commented will be
              notified.
            </Trans>
          </Dialog.Description>
        </Dialog.Header>

        <Dialog.Footer>
          <Button variant="danger" loading={mutation.isPending} onClick={() => mutation.mutate()}>
            <Trans>Cancel the request</Trans>
          </Button>
          <Dialog.Close>
            <Button variant="secondary">
              <Trans>Back</Trans>
            </Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function changeRequestMutation(
  requestId: string,
  action: 'fulfil' | 'cancel',
  messages: { success: string; error: string },
) {
  return mutationOptions({
    mutationFn: () => api('PUT', `/requests/${requestId}/${action}`),
    onSuccess: async (_data, _variables, _result, { client }) => {
      await client.invalidateQueries(queries.request(requestId));
      showToast(messages.success);
    },
    onError: () => showToast(messages.error, 'error'),
  });
}

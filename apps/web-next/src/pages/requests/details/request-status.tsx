import { Trans } from '@lingui/react/macro';
import { RequestStatus } from '@sel/shared';
import { Alert } from '@sel/ui';

export function RequestStatusAlert({ status }: { status: RequestStatus }) {
  if (status === RequestStatus.fulfilled) {
    return (
      <Alert.Root tone="success">
        <Alert.Title>
          <Trans>This request is fulfilled</Trans>
        </Alert.Title>
      </Alert.Root>
    );
  }

  if (status === RequestStatus.canceled) {
    return (
      <Alert.Root tone="warning">
        <Alert.Title>
          <Trans>This request was canceled</Trans>
        </Alert.Title>
      </Alert.Root>
    );
  }

  return null;
}

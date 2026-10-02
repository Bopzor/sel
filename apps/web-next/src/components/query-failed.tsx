import { Trans } from '@lingui/react/macro';
import { Alert, AlertActions, AlertDescription, AlertTitle, Button } from '@sel/ui';

export function QueryFailed({
  title,
  retrying,
  retry,
}: {
  title: React.ReactNode;
  retrying: boolean;
  retry: () => void;
}) {
  return (
    <Alert tone="danger">
      <AlertTitle>{title}</AlertTitle>

      <AlertDescription>
        <Trans>Check your internet access, then try again.</Trans>
      </AlertDescription>

      <AlertActions>
        <Button size="sm" variant="secondary" loading={retrying} onClick={retry}>
          <Trans>Retry</Trans>
        </Button>
      </AlertActions>
    </Alert>
  );
}

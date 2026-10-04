import { Trans, useLingui } from '@lingui/react/macro';
import { createRequestBodySchema } from '@sel/shared';
import { Card, showToast } from '@sel/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { api } from 'src/app/api';
import { routes } from 'src/app/routes';
import { BackButton } from 'src/components/link';

import { RequestForm } from '../request-form';

export function CreateRequestPage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const onSuccess = async (requestId: string) => {
    await queryClient.invalidateQueries({ queryKey: ['requests'] });
    await navigate(routes.request(requestId));
    showToast(t`Request posted`);
  };

  return (
    <div className="stack gap-4">
      <BackButton href={routes.requests()}>
        <Trans>Requests</Trans>
      </BackButton>

      <header className="stack max-w-content gap-1">
        <h1 className="text-title-1">
          <Trans>Post a request</Trans>
        </h1>
        <p className="text-muted">
          <Trans>Ask the members for help: they will be notified and can offer theirs.</Trans>
        </p>
      </header>

      <Card.Root className="max-w-content">
        <RequestForm
          schema={createRequestBodySchema}
          mutationFn={(body) => api<string>('POST', '/requests', { body })}
          onSuccess={onSuccess}
        />
      </Card.Root>
    </div>
  );
}

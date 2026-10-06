import { Trans, useLingui } from '@lingui/react/macro';
import { Card, showToast } from '@sel/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { api } from 'src/app/api';
import { routes } from 'src/app/routes';
import { BackButton } from 'src/components/link';

import { InformationForm } from '../information-form';

export function CreateInformationPage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const onSuccess = async (informationId: string) => {
    await queryClient.invalidateQueries({ queryKey: ['information-list'] });
    await navigate(routes.informationDetails(informationId));
    showToast(t`Information published`);
  };

  return (
    <div className="stack gap-4">
      <BackButton href={routes.information()}>
        <Trans>Information</Trans>
      </BackButton>

      <header className="stack max-w-content gap-1">
        <h1 className="text-title-1">
          <Trans>Publish information</Trans>
        </h1>
        <p className="text-muted">
          <Trans>Share news with the members: they will be notified and can comment.</Trans>
        </p>
      </header>

      <Card.Root className="max-w-content">
        <InformationForm
          mutationFn={(body) => api<string>('POST', '/information', { body })}
          onSuccess={onSuccess}
          submitLabel={<Trans>Publish the information</Trans>}
          errorTitle={<Trans>The information could not be published</Trans>}
        />
      </Card.Root>
    </div>
  );
}

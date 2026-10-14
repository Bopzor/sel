import { Trans } from '@lingui/react/macro';
import { Switch } from '@sel/ui';

import { useSession } from 'src/app/session';

import { CompleteProfileStepButton, StepLayout, useUpdateProfile } from './step-layout';

export function ContactVisibilityStep() {
  return (
    <StepLayout
      title={<Trans>Who sees your contact details?</Trans>}
      actions={
        <CompleteProfileStepButton step="contactVisibility">
          <Trans>Next</Trans>
        </CompleteProfileStepButton>
      }
      className="stack gap-6"
    >
      <VisibilitySwitch field="emailVisible" label={<Trans>Show my email address on my member page</Trans>} />

      <VisibilitySwitch
        field="phoneNumberVisible"
        label={<Trans>Show my phone number on my member page</Trans>}
      />
    </StepLayout>
  );
}

type VisibilitySwitchProps = {
  field: 'emailVisible' | 'phoneNumberVisible';
  label: React.ReactNode;
};

function VisibilitySwitch({ field, label }: VisibilitySwitchProps) {
  const me = useSession();
  const { isPending, variables, mutate } = useUpdateProfile();

  // Show the requested value until the session is reloaded
  const visible = isPending ? Boolean(variables[field]) : me[field];

  return (
    <Switch
      size="sm"
      label={label}
      checked={visible}
      onChange={(event) => mutate({ [field]: event.target.checked })}
    />
  );
}

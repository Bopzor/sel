import { ProfileStep } from '@sel/shared';
import { entries } from '@sel/utils';
import { useEffect } from 'react';

import { isMobile, isPwaInstalled } from 'src/app/install-app';
import { useSession } from 'src/app/session';

import { NameStep } from './01-name-step';
import { ContactInfoStep } from './02-contact-info-step';
import { ContactVisibilityStep } from './03-contact-visibility-step';
import { NotificationsStep } from './04-notifications-step';
import { AddressStep } from './05-address-step';
import { AvatarStep } from './06-avatar-step';
import { BioStep } from './07-bio-step';
import { InterestsStep } from './08-interests-step';
import { InstallAppStep } from './09-install-app-step';
import { HelpStep } from './10-help-step';
import { useCompleteProfileStep } from './step-layout';

const steps: Record<ProfileStep, React.ComponentType> = {
  [ProfileStep.name]: NameStep,
  [ProfileStep.contactInfo]: ContactInfoStep,
  [ProfileStep.contactVisibility]: ContactVisibilityStep,
  [ProfileStep.notifications]: NotificationsStep,
  [ProfileStep.address]: AddressStep,
  [ProfileStep.avatar]: AvatarStep,
  [ProfileStep.bio]: BioStep,
  [ProfileStep.interests]: InterestsStep,
  [ProfileStep.installApp]: InstallAppStep,
  [ProfileStep.help]: HelpStep,
};

export function ProfileCompletionCard() {
  const { completedProfileSteps } = useSession();

  const { mutate: completeStep } = useCompleteProfileStep({ reportError: false });

  const mobile = isMobile();
  const installed = isPwaInstalled();

  useEffect(() => {
    if (mobile && installed && !completedProfileSteps.includes(ProfileStep.installApp)) {
      completeStep(ProfileStep.installApp);
    }
  }, [mobile, installed, completedProfileSteps, completeStep]);

  const shown = (step: ProfileStep) => {
    if (completedProfileSteps.includes(step)) {
      return false;
    }

    if (step === ProfileStep.installApp) {
      return mobile;
    }

    return true;
  };

  const Component = entries(steps).find(([step]) => shown(step))?.[1];

  return Component ? <Component /> : null;
}

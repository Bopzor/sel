import { Trans, useLingui } from '@lingui/react/macro';
import type { AuthenticatedMember } from '@sel/shared';
import { LinkButton } from '@sel/ui';
import { useSuspenseQuery } from '@tanstack/react-query';

import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { Amount } from 'src/components/amount';
import { DefinitionItem } from 'src/components/definition-item';
import { Link } from 'src/components/link';

import { AddressSection } from './address-section';
import { BioSection } from './bio-section';
import { ContactSection } from './contact-section';
import { IdentitySection } from './identity-section';
import { ProfileSection } from './profile-section';

export function ProfilePage() {
  const { data: member } = useSuspenseQuery(queries.session());

  return (
    <div className="stack gap-6">
      <header className="row flex-wrap items-center justify-between gap-3">
        <h1 className="text-title-1">
          <Trans>Profile</Trans>
        </h1>

        <LinkButton Link={Link} href={routes.member(member.id)} variant="secondary" size="sm">
          <Trans>See my public profile</Trans>
        </LinkButton>
      </header>

      <div className="mx-auto stack w-full max-w-content gap-6">
        <IdentitySection member={member} />
        <ContactSection member={member} />
        <AddressSection member={member} />
        <BioSection member={member} />
        <MembershipCard member={member} />
      </div>
    </div>
  );
}

function MembershipCard({ member }: { member: AuthenticatedMember }) {
  const { i18n } = useLingui();
  const { number, balance } = member;
  const since = new Date(member.membershipStartDate).toLocaleDateString(i18n.locale, { dateStyle: 'long' });

  return (
    <ProfileSection title={<Trans>Membership</Trans>}>
      <dl className="grid gap-4 sm:grid-cols-3">
        <DefinitionItem label={<Trans>Member number</Trans>} className="text-title-3 tabular-nums">
          {number}
        </DefinitionItem>
        <DefinitionItem label={<Trans>Member since</Trans>} className="text-title-3">
          {since}
        </DefinitionItem>
        <DefinitionItem label={<Trans>Balance</Trans>} className="text-title-2 tabular-nums">
          <Amount value={balance} />
        </DefinitionItem>
      </dl>
    </ProfileSection>
  );
}

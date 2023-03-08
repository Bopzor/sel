import { EnvelopeIcon, HomeIcon, PhoneIcon } from '@heroicons/react/24/solid';

import { BackLink } from '../../../../app/components/back-link';
import { FallbackSpinner } from '../../../../app/components/fallback';
import { Show } from '../../../../app/components/show';
import { useQuery } from '../../../../app/hooks/use-query';
import { Translation } from '../../../../app/i18n.context';
import { useRouteParam } from '../../../../renderer/page-context';
import { TOKENS } from '../../../../tokens';
import { MemberAvatarName } from '../../components/member-avatar-name';
import { formatAddress } from '../../format-address';
import { Member } from '../../index';

import { MemberMap } from './member-map';

const T = Translation.create('members');

export const Page = () => {
  const id = useRouteParam('memberId');
  const [member] = useQuery(TOKENS.getMemberHandler, { id });

  return (
    <>
      <BackLink href="/membres" />

      <Show when={member} fallback={<FallbackSpinner />}>
        {(member) => <MemberProfile member={member} />}
      </Show>
    </>
  );
};

type MemberProfileProps = {
  member: Member;
};

const MemberProfile = ({ member }: MemberProfileProps) => (
  <div className="card p-2">
    <MemberAvatarName member={member} inline />

    <hr className="my-2" />

    <div className="col md:row min-h-[24rem] gap-2">
      <div className="col flex-1 gap-1">
        <LabelValue label={<T>Phone number</T>} icon={<PhoneIcon className="h-1 w-1" />}>
          <a href={`tel:${member.phoneNumber}`} className="hover:underline">
            {member.phoneNumber}
          </a>
        </LabelValue>

        <LabelValue label={<T>Email address</T>} icon={<EnvelopeIcon className="h-1 w-1" />}>
          <a href="mailto:myself@domain.tld" className="hover:underline">
            {member.email}
          </a>
        </LabelValue>

        <LabelValue label={<T>Mailing Address</T>} icon={<HomeIcon className="h-1 w-1" />}>
          <div className="whitespace-pre-wrap">{formatAddress(member.address)}</div>
        </LabelValue>
      </div>

      <div className="h-[24rem] md:h-auto md:flex-1">
        <MemberMap member={member} />
      </div>
    </div>
  </div>
);

type LabelValueProps = {
  label: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
};

const LabelValue = ({ label, children, icon }: LabelValueProps) => (
  <div>
    <strong className="row mb-0.5 items-center gap-0.5">
      {icon} {label}
    </strong>

    {children}
  </div>
);

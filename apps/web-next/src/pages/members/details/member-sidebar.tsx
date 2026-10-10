import { Plural, Trans, useLingui } from '@lingui/react/macro';
import type { Member } from '@sel/shared';
import { Badge, Button, Card, Icon, IconButton, LinkButton, showToast, Skeleton } from '@sel/ui';
import { differenceInMonths } from '@sel/utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { lazy, Suspense, useId, useState } from 'react';

import { formatAddressLines, formatMemberName, formatPhoneNumber } from 'src/app/format';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';
import { MemberAvatar } from 'src/components/member-avatar';
import { TransactionDialog } from 'src/components/transaction-dialog';
import { Unit } from 'src/components/unit';
import { useClipboard } from 'src/hooks/use-clipboard';
import { useMediaQuery } from 'src/hooks/use-media-query';

import { downloadVCard } from './vcard';

export function MemberSidebar({ member }: { member: Member }) {
  return (
    <>
      <IdentityCard member={member} />
      <ContactCard member={member} />
      <AddressCard member={member} />
    </>
  );
}

function IdentityCard({ member }: { member: Member }) {
  const { data: me } = useSuspenseQuery(queries.session());
  const { number } = member;

  return (
    <Card.Root>
      <Card.Body className="stack items-center gap-4 text-center">
        <MemberAvatar
          member={member}
          size="full"
          decorative
          neutral
          placeholder={<Icon name="profile" className="size-1/3! opacity-40" />}
          className="max-w-48 border"
        />

        <div className="stack items-center gap-2">
          <h1 className="text-title-2">{formatMemberName(member)}</h1>

          <div className="row flex-wrap items-center justify-center gap-2">
            <span className="text-body-sm text-muted tabular-nums">
              <Trans>Member #{number}</Trans>
            </span>

            {member.committeeMember && (
              <Badge tone="accent">
                <Trans>Committee member</Trans>
              </Badge>
            )}
          </div>

          <MembershipDate date={member.membershipStartDate} />
        </div>

        {member.id === me.id ? (
          <LinkButton Link={Link} href={routes.profile()} variant="secondary" icon="edit">
            <Trans>Edit my profile</Trans>
          </LinkButton>
        ) : (
          <CreateExchange member={member} />
        )}
      </Card.Body>
    </Card.Root>
  );
}

function MembershipDate({ date }: { date: string }) {
  const { i18n } = useLingui();
  const since = new Date(date).toLocaleDateString(i18n.locale, { month: 'long', year: 'numeric' });
  const months = differenceInMonths(new Date(), date);
  const years = Math.floor(months / 12);

  const getDuration = () => {
    if (months < 1) {
      return <Trans>less than a month</Trans>;
    }

    if (years < 1) {
      return <Plural value={months} one="# month" other="# months" />;
    }

    return <Plural value={years} one="# year" other="# years" />;
  };

  const duration = getDuration();

  return (
    <p className="text-body-sm text-muted">
      <Trans>
        Member since {since} ({duration})
      </Trans>
    </p>
  );
}

function CreateExchange({ member }: { member: Member }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button icon="exchange" onClick={() => setOpen(true)}>
        <Trans>
          Exchange <Unit plural />
        </Trans>
      </Button>

      <TransactionDialog open={open} onClose={() => setOpen(false)} counterpart={member} />
    </>
  );
}

function ContactCard({ member }: { member: Member }) {
  const { t } = useLingui();
  const { email, phoneNumber } = member;
  const titleId = useId();

  if (email === undefined && phoneNumber === undefined) {
    return null;
  }

  return (
    <Card.Root role="region" aria-labelledby={titleId}>
      <Card.Header>
        <Card.Title level={2} id={titleId}>
          <Trans>Contact</Trans>
        </Card.Title>
      </Card.Header>

      <Card.Body className="stack gap-4">
        <ul className="stack gap-2">
          {email !== undefined && (
            <ContactItem
              icon="email"
              href={`mailto:${email}`}
              value={email}
              copyLabel={t`Copy the email address`}
              copiedMessage={t`Email address copied`}
            >
              {email}
            </ContactItem>
          )}

          {phoneNumber !== undefined && (
            <ContactItem
              icon="phone"
              href={`tel:${phoneNumber}`}
              value={phoneNumber}
              copyLabel={t`Copy the phone number`}
              copiedMessage={t`Phone number copied`}
            >
              {formatPhoneNumber(phoneNumber)}
            </ContactItem>
          )}
        </ul>

        <Button
          variant="secondary"
          icon="add"
          onClick={() => downloadVCard(member)}
          // Opening a vCard adds it to the contacts on a phone, not on a computer.
          className="self-start not-pointer-coarse:hidden"
        >
          <Trans>Add to my contacts</Trans>
        </Button>
      </Card.Body>
    </Card.Root>
  );
}

type ContactItemProps = {
  icon: 'email' | 'phone';
  href: string;
  value: string;
  copyLabel: string;
  copiedMessage: string;
  children: string;
};

function ContactItem({ icon, href, value, copyLabel, copiedMessage, children }: ContactItemProps) {
  const clipboard = useClipboard();

  const copy = () => {
    clipboard.copy(value, () => showToast(copiedMessage));
  };

  return (
    <li className="row items-center gap-2">
      <Icon name={icon} size="sm" className="text-subtle" />
      <a href={href} title={value} className="min-w-0 flex-1 truncate text-primary underline">
        {children}
      </a>
      <IconButton icon="copy" label={copyLabel} size="sm" onClick={copy} />
    </li>
  );
}

function AddressCard({ member }: { member: Member }) {
  const { address } = member;
  const titleId = useId();

  if (address === undefined) {
    return null;
  }

  return (
    <Card.Root role="region" aria-labelledby={titleId}>
      <Card.Header>
        <Card.Title level={2} id={titleId}>
          <Trans>Address</Trans>
        </Card.Title>
      </Card.Header>

      <Card.Body className="stack items-start gap-4">
        <address className="wrap-break-word whitespace-pre-line not-italic">
          {formatAddressLines(address).join('\n')}
        </address>

        {address.position && (
          <>
            <AddressMap position={address.position} />

            <Link
              href={routes.membersMap(member.id)}
              className="row items-center gap-2 text-primary underline"
            >
              <Icon name="map" size="sm" />
              <Trans>Show on the members map</Trans>
            </Link>
          </>
        )}
      </Card.Body>
    </Card.Root>
  );
}

const MemberMap = lazy(() => import('./member-map').then((module) => ({ default: module.MemberMap })));

function AddressMap({ position }: { position: [number, number] }) {
  const desktop = useMediaQuery('(min-width: 80rem)');
  const [shown, setShown] = useState(false);

  if (!desktop && !shown) {
    return (
      <Button variant="secondary" icon="map" onClick={() => setShown(true)}>
        <Trans>Show the map</Trans>
      </Button>
    );
  }

  return (
    <Suspense fallback={<Skeleton variant="rect" className="h-48 w-full rounded-md" />}>
      <MemberMap position={position} />
    </Suspense>
  );
}

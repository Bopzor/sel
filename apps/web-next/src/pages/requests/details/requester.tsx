import { Trans } from '@lingui/react/macro';
import type { Requester } from '@sel/shared';
import { Card, Icon } from '@sel/ui';

import { formatMemberName, formatPhoneNumber } from 'src/app/format';
import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';
import { MemberAvatar } from 'src/components/member-avatar';

export function RequesterCard({ requester }: { requester: Requester }) {
  const { email, phoneNumber } = requester;

  const phoneNumberItem = phoneNumber !== undefined && (
    <ContactItem icon="phone" href={`tel:${phoneNumber}`}>
      {formatPhoneNumber(phoneNumber)}
    </ContactItem>
  );

  const emailItem = email !== undefined && (
    <ContactItem icon="email" href={`mailto:${email}`}>
      {email}
    </ContactItem>
  );

  return (
    <Card.Root>
      <Card.Body className="stack gap-4">
        <Link href={routes.member(requester.id)} className="row items-center gap-3">
          <MemberAvatar member={requester} size="lg" decorative />

          <div className="stack min-w-0">
            <p className="text-body-sm text-muted">
              <Trans>Requested by</Trans>
            </p>
            <h2 className="text-title-3">{formatMemberName(requester)}</h2>
          </div>
        </Link>

        {(phoneNumberItem || emailItem) && (
          <ul className="stack gap-2 text-body-sm">
            {phoneNumberItem}
            {emailItem}
          </ul>
        )}
      </Card.Body>
    </Card.Root>
  );
}

function ContactItem({ icon, href, children }: { icon: 'phone' | 'email'; href: string; children: string }) {
  return (
    <li className="row items-center gap-2">
      <Icon name={icon} size="sm" className="text-subtle" />
      <a href={href} className="min-w-0 wrap-break-word text-primary underline">
        {children}
      </a>
    </li>
  );
}

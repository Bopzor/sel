import { Trans } from '@lingui/react/macro';
import type { LightMember, MemberActivityItem, MemberActivityType } from '@sel/shared';
import { Icon, ListItem, type IconName } from '@sel/ui';

import { formatExcerpt, formatMemberName } from 'src/app/format';
import { routes } from 'src/app/routes';
import { Amount } from 'src/components/amount';
import { Link } from 'src/components/link';
import { RelativeDate } from 'src/components/relative-date';

const icons: Record<MemberActivityType, IconName> = {
  request: 'request',
  'request-answer': 'answer',
  event: 'event',
  'event-participation': 'participation',
  information: 'information',
  comment: 'comment',
  transaction: 'exchange',
};

export function ActivityItem({ memberId, item }: { memberId: string; item: MemberActivityItem }) {
  return (
    <ListItem.Root className="items-start">
      <span className="flex size-avatar-md shrink-0 items-center justify-center rounded-full bg-page text-muted">
        <Icon name={icons[item.type]} />
      </span>

      <ListItem.Content className="gap-1">
        <ListItem.Title>
          <ActivitySentence memberId={memberId} item={item} />
        </ListItem.Title>

        {item.type === 'transaction' && (
          <ListItem.Description className="text-default">{item.description}</ListItem.Description>
        )}

        {item.type === 'comment' && (
          <blockquote className="line-clamp-2 border-l-2 pl-3 text-body-sm">
            {formatExcerpt(item.body)}
          </blockquote>
        )}

        <p className="text-caption text-subtle">
          <RelativeDate date={item.date} className="whitespace-nowrap" />
        </p>
      </ListItem.Content>
    </ListItem.Root>
  );
}

function ActivitySentence({ memberId, item }: { memberId: string; item: MemberActivityItem }) {
  if (item.type === 'transaction') {
    const amount = <Amount value={item.amount} />;

    if (item.payer.id === memberId) {
      const recipient = <MemberLink member={item.recipient} />;
      return (
        <Trans>
          Sent {amount} to {recipient}
        </Trans>
      );
    }

    const payer = <MemberLink member={item.payer} />;
    return (
      <Trans>
        Received {amount} from {payer}
      </Trans>
    );
  }

  const { entity } = item;
  const link = <EntityLink entity={entity} />;
  const past = entity.date !== undefined && new Date(entity.date) < new Date();

  switch (item.type) {
    case 'request':
      return <Trans>Posted the request {link}</Trans>;

    case 'event':
      return past ? <Trans>Organized {link}</Trans> : <Trans>Organizes {link}</Trans>;

    case 'information':
      return <Trans>Posted the information {link}</Trans>;

    case 'request-answer':
      return <Trans>Offered to help on {link}</Trans>;

    case 'event-participation':
      return past ? <Trans>Attended {link}</Trans> : <Trans>Attends {link}</Trans>;

    case 'comment':
      return <Trans>Commented on {link}</Trans>;
  }
}

function MemberLink({ member }: { member: LightMember }) {
  return (
    <Link href={routes.member(member.id)} className="text-body-strong hover:underline">
      {formatMemberName(member)}
    </Link>
  );
}

function EntityLink({ entity }: { entity: Exclude<MemberActivityItem, { type: 'transaction' }>['entity'] }) {
  const href = {
    request: routes.request,
    event: routes.event,
    information: routes.informationDetails,
  }[entity.type](entity.id);

  return (
    <Link href={href} className="text-body-strong hover:underline">
      {entity.title}
    </Link>
  );
}

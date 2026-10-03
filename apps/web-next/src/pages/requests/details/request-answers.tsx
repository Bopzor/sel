import { Trans } from '@lingui/react/macro';
import type { RequestAnswer } from '@sel/shared';
import { Card, Icon, ListItem } from '@sel/ui';

import { formatMemberName } from 'src/app/format';
import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';
import { MemberAvatar } from 'src/components/member-avatar';

export function RequestAnswers({ answers }: { answers: RequestAnswer[] }) {
  const sorted = answers.toSorted(
    (a, b) => Number(b.answer === 'positive') - Number(a.answer === 'positive'),
  );

  return (
    <section className="stack gap-3">
      <h2 className="text-title-3">
        <Trans>Answers</Trans>
      </h2>

      {answers.length === 0 && (
        <p className="text-body-sm text-muted">
          <Trans>No one has answered yet.</Trans>
        </p>
      )}

      {answers.length > 0 && (
        <Card.Root>
          <AnswersList answers={sorted} />
        </Card.Root>
      )}
    </section>
  );
}

function AnswersList({ answers }: { answers: RequestAnswer[] }) {
  return (
    <ul>
      {answers.map(({ id, member, answer }) => (
        <ListItem.Root key={id}>
          <MemberAvatar member={member} size="sm" decorative />

          <ListItem.Content>
            <ListItem.Title className="text-body-sm font-medium">
              <ListItem.Link Link={Link} href={routes.member(member.id)}>
                {formatMemberName(member)}
              </ListItem.Link>
            </ListItem.Title>

            {answer === 'positive' && (
              <p className="row items-center gap-1 text-caption text-success">
                <Icon name="check" size="sm" />
                <Trans>Can help</Trans>
              </p>
            )}

            {answer === 'negative' && (
              <p className="text-caption text-subtle">
                <Trans>Can't help</Trans>
              </p>
            )}
          </ListItem.Content>
        </ListItem.Root>
      ))}
    </ul>
  );
}

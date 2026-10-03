import { Trans } from '@lingui/react/macro';
import type { RequestAnswer } from '@sel/shared';
import { Card, Icon } from '@sel/ui';

import { formatMemberName } from 'src/app/format';
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
    <ul className="divide-y">
      {answers.map(({ id, member, answer }) => (
        <li key={id} className="row items-center gap-3 px-4 py-3">
          <MemberAvatar member={member} size="sm" decorative />

          <div className="stack min-w-0 flex-1">
            <p className="truncate text-body-sm">{formatMemberName(member)}</p>

            {answer === 'positive' ? (
              <p className="row items-center gap-1 text-caption text-success">
                <Icon name="check" size="sm" />
                <Trans>Can help</Trans>
              </p>
            ) : (
              <p className="text-caption text-subtle">
                <Trans>Can't help</Trans>
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

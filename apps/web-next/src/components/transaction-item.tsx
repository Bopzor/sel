import { Trans, useLingui } from '@lingui/react/macro';
import { TransactionStatus, type Member, type Transaction } from '@sel/shared';
import { Button, ListItem, showToast } from '@sel/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';

import { api } from 'src/app/api';
import { formatMemberName } from 'src/app/format';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { useSession } from 'src/app/session';
import { Amount } from 'src/components/amount';
import { Bullet } from 'src/components/bullet';
import { Link } from 'src/components/link';
import { MemberAvatar } from 'src/components/member-avatar';
import { RelativeDate } from 'src/components/relative-date';

type TransactionItemProps = {
  member: Member;
  transaction: Transaction;
};

export function TransactionItem({ member, transaction }: TransactionItemProps) {
  const { payer, recipient, request } = transaction;
  const paid = payer.id === member.id;
  const counterpart = paid ? recipient : payer;

  return (
    <ListItem.Root className="items-start">
      <MemberAvatar member={counterpart} decorative />

      <ListItem.Content className="gap-1">
        <ListItem.Header>
          <ListItem.Title className="text-body-strong">
            <Link href={routes.member(counterpart.id)} className="hover:underline">
              {formatMemberName(counterpart)}
            </Link>
          </ListItem.Title>

          {transaction.status === TransactionStatus.canceled ? (
            <span className="text-body-strong text-muted line-through">
              <Amount value={transaction.amount} />
            </span>
          ) : (
            <span className={clsx('text-body-strong', paid ? 'text-default' : 'text-success')}>
              <Amount value={paid ? -transaction.amount : transaction.amount} signed />
            </span>
          )}
        </ListItem.Header>

        <ListItem.Description className="text-default">{transaction.description}</ListItem.Description>

        <p className="text-caption text-subtle">
          <RelativeDate date={transaction.date} className="whitespace-nowrap" />

          {request && (
            <>
              <Bullet />
              <Link href={routes.request(request.id)} className="underline">
                {request.title}
              </Link>
            </>
          )}
        </p>

        {transaction.payerComment && <TransactionComment author={payer} comment={transaction.payerComment} />}

        {transaction.recipientComment && (
          <TransactionComment author={recipient} comment={transaction.recipientComment} />
        )}

        {transaction.status === TransactionStatus.pending && (
          <div className="mt-2">
            <PendingTransactionActions transaction={transaction} />
          </div>
        )}
      </ListItem.Content>
    </ListItem.Root>
  );
}

function TransactionComment({ author, comment }: { author: Transaction['payer']; comment: string }) {
  const name = formatMemberName(author);

  return (
    <figure className="mt-1 border-l-2 pl-3 text-body-sm">
      <blockquote className="line-clamp-3 whitespace-pre-line">{comment}</blockquote>
      <figcaption className="text-caption font-medium text-muted">{name}</figcaption>
    </figure>
  );
}

function PendingTransactionActions({ transaction }: { transaction: Transaction }) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const me = useSession();

  const mutation = useMutation({
    mutationFn: (action: 'accept' | 'cancel') => api('PUT', `/transactions/${transaction.id}/${action}`),
    onSuccess: async (_, action) => {
      showToast(action === 'accept' ? t`Exchange accepted` : t`Exchange declined`);

      await Promise.all([
        queryClient.invalidateQueries(queries.session()),
        queryClient.invalidateQueries({ queryKey: ['members'] }),
      ]);
    },
    onError: () => {
      showToast(t`The exchange couldn't be updated`, 'error');
    },
  });

  // Only the payer confirms an exchange.
  if (transaction.payer.id !== me.id) {
    const payer = formatMemberName(transaction.payer);

    return (
      <p className="text-body-sm text-muted">
        <Trans>Waiting for {payer} to confirm</Trans>
      </p>
    );
  }

  return (
    <div className="row flex-wrap gap-2">
      <Button
        size="sm"
        icon="check"
        loading={mutation.isPending && mutation.variables === 'accept'}
        disabled={mutation.isPending}
        onClick={() => mutation.mutate('accept')}
      >
        <Trans>Accept</Trans>
      </Button>
      <Button
        size="sm"
        variant="secondary"
        loading={mutation.isPending && mutation.variables === 'cancel'}
        disabled={mutation.isPending}
        onClick={() => mutation.mutate('cancel')}
      >
        <Trans>Decline</Trans>
      </Button>
    </div>
  );
}

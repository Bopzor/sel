import { Member } from '@sel/shared';
import { useParams } from '@solidjs/router';
import { Icon } from 'solid-heroicons';
import { arrowsRightLeft, sparkles, user } from 'solid-heroicons/solid';
import { ComponentProps, createResource, createSignal, JSX, Show } from 'solid-js';

import { authenticatedMember } from '../../../app-context';
import { breadcrumb, Breadcrumb } from '../../../components/breadcrumb';
import { Button } from '../../../components/button';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { TOKENS } from '../../../tokens';
import { CreateTransactionDialog } from '../../transactions/create-transaction-dialog';

import { ContactInformation } from './contact-information';
import { MemberBio } from './member-bio';
import { MemberInterests } from './member-interests';
import { MemberMap } from './member-map';
import { MemberNotFound } from './member-not-found';
import { MemberTransactions } from './member-transactions';

const T = Translate.prefix('members');

export default function MemberDetailsPage() {
  const memberApi = container.resolve(TOKENS.memberApi);
  const { memberId } = useParams<{ memberId: string }>();

  const [member] = createResource(memberId, async (memberId) => {
    return memberApi.getMember(memberId);
  });

  return (
    <>
      <Breadcrumb items={[breadcrumb.members(), member.latest && breadcrumb.member(member.latest)]} />

      <Show when={member()}>{(member) => <MemberDetails member={member()} />}</Show>

      <Show when={!member()}>
        <MemberNotFound />
      </Show>
    </>
  );
}

function MemberDetails(props: { member: Member }) {
  const memberApi = container.resolve(TOKENS.memberApi);

  const [transactions, { refetch: refetchTransactions }] = createResource(
    () => props.member.id,
    async (memberId) => {
      return memberApi.listMemberTransactions(memberId);
    },
  );

  return (
    <div class="col gap-8">
      <div class="card p-4 md:p-8">
        <div class="row mb-4 items-center justify-between gap-4">
          <div class="row items-center gap-6">
            <MemberAvatarName
              member={props.member}
              classes={{ avatar: '!size-16', name: 'text-xl font-semibold' }}
            />
          </div>
          <Show when={props.member.id !== authenticatedMember()?.id}>
            <CreateTransactionButton member={props.member} onCreated={() => void refetchTransactions()} />
          </Show>
        </div>

        <hr class="my-4 md:my-6" />

        <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
          <ContactInformation member={props.member} />
          <MemberMap member={props.member} />
        </div>
      </div>

      <Section show={props.member.bio !== undefined} icon={user} title={<T id="bio" />}>
        <MemberBio member={props.member} />
      </Section>

      <Section show={props.member.interests.length > 0} icon={sparkles} title={<T id="interests.title" />}>
        <MemberInterests member={props.member} />
      </Section>

      <Section show icon={arrowsRightLeft} title={<T id="transactions.title" />}>
        <MemberTransactions member={props.member} transactions={transactions.latest} />
      </Section>
    </div>
  );
}

function Section(props: {
  show: boolean;
  icon: ComponentProps<typeof Icon>['path'];
  title: JSX.Element;
  children: JSX.Element;
}) {
  return (
    <Show when={props.show}>
      <section class="max-w-4xl">
        <header class="row mb-4 items-center gap-2 text-primary">
          <div>
            <Icon path={props.icon} class="size-6" />
          </div>

          <h2>{props.title}</h2>
        </header>

        {props.children}
      </section>
    </Show>
  );
}

function CreateTransactionButton(props: { member: Member; onCreated: () => void }) {
  const transactionApi = container.resolve(TOKENS.transactionApi);
  const [open, setOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <T id="transactions.create.cta" />
      </Button>

      <CreateTransactionDialog
        open={open()}
        onClose={() => setOpen(false)}
        onCreated={props.onCreated}
        createTransaction={(values) => transactionApi.createTransaction(values)}
        member={props.member}
      />
    </>
  );
}

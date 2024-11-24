import { Member } from '@sel/shared';
import { useParams } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { arrowsRightLeft, sparkles, user } from 'solid-heroicons/solid';
import { ComponentProps, createSignal, JSX, Show } from 'solid-js';

import { breadcrumb, Breadcrumb } from '../../../components/breadcrumb';
import { Button } from '../../../components/button';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { TOKENS } from '../../../tokens';
import { getAuthenticatedMember } from '../../../utils/authenticated-member';
import { CreateTransactionDialog } from '../../transactions/create-transaction-dialog';

import { ContactInformation } from './contact-information';
import { MemberBio } from './member-bio';
import { MemberInterests } from './member-interests';
import { MemberMap } from './member-map';
import { MemberNotFound } from './member-not-found';
import { MemberTransactions } from './member-transactions';

const T = Translate.prefix('members');

export default function MemberDetailsPage() {
  const api = container.resolve(TOKENS.api);
  const params = useParams<{ memberId: string }>();

  const query = createQuery(() => ({
    queryKey: ['getMember', params.memberId],
    queryFn: () => api.getMember({ path: { memberId: params.memberId } }),
  }));

  return (
    <>
      <Breadcrumb items={[breadcrumb.members(), query.data && breadcrumb.member(query.data)]} />

      <Show when={query.data} fallback={<MemberNotFound />}>
        {(member) => <MemberDetails member={member()} />}
      </Show>
    </>
  );
}

function MemberDetails(props: { member: Member }) {
  const api = container.resolve(TOKENS.api);
  const authenticatedMember = getAuthenticatedMember();

  const query = createQuery(() => ({
    queryKey: ['listMemberTransactions', props.member.id],
    queryFn: () => api.listMemberTransactions({ path: { memberId: props.member.id } }),
  }));

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
            <CreateTransactionButton member={props.member} onCreated={() => query.refetch()} />
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
        <MemberTransactions member={props.member} transactions={query.data} />
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

function CreateTransactionButton(props: { member: Member; onCreated: () => Promise<unknown> }) {
  const api = container.resolve(TOKENS.api);
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
        createTransaction={(values) => api.createTransaction({ body: values })}
        member={props.member}
      />
    </>
  );
}

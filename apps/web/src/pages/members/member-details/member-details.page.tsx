import { Member } from '@sel/shared';
import { useParams } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { arrowsRightLeft, sparkles, user } from 'solid-heroicons/solid';
import { ComponentProps, createSignal, JSX, Show } from 'solid-js';

import { api } from 'src/application/api';
import { apiQuery, getIsAuthenticatedMember } from 'src/application/query';
import { Card } from 'src/components/card';
import { BoxSkeleton } from 'src/components/skeleton';
import { TransactionDialog } from 'src/components/transaction-dialog';
import { createTranslate } from 'src/intl/translate';

import { breadcrumb, Breadcrumb } from '../../../components/breadcrumb';
import { Button } from '../../../components/button';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { ContactInformation } from './contact-information';
import { MemberBio } from './member-bio';
import { MemberInterests } from './member-interests';
import { MemberMap } from './member-map';
import { MemberTransactions } from './member-transactions';

const T = createTranslate('pages.members.details');

export function MemberDetailsPage() {
  const params = useParams<{ memberId: string }>();
  const query = createQuery(() => apiQuery('getMember', { path: { memberId: params.memberId } }));

  return (
    <>
      <Breadcrumb items={[breadcrumb.members(), query.data && breadcrumb.member(query.data)]} />

      <Show when={query.data} fallback={<Skeleton />}>
        {(member) => <MemberDetails member={member()} />}
      </Show>
    </>
  );
}

function Skeleton() {
  return (
    <div class="col gap-8">
      <BoxSkeleton height={16} />
      <BoxSkeleton height={8} />
      <BoxSkeleton height={8} />
    </div>
  );
}

function MemberDetails(props: { member: Member }) {
  const isAuthenticatedMember = getIsAuthenticatedMember();

  const query = createQuery(() =>
    apiQuery('listMemberTransactions', { path: { memberId: props.member.id } }),
  );

  return (
    <div class="col gap-8">
      <h1>
        <MemberAvatarName
          link={false}
          member={props.member}
          classes={{ avatar: '!size-12 md:!size-24', root: 'gap-4 md:gap-8' }}
        />
      </h1>

      <Card class="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ContactInformation member={props.member} />
        <MemberMap member={props.member} />
      </Card>

      <Section show={props.member.bio} icon={user} title={<T id="bio" />}>
        <MemberBio member={props.member} />
      </Section>

      <Section show={props.member.interests.length > 0} icon={sparkles} title={<T id="interests.title" />}>
        <MemberInterests member={props.member} />
      </Section>

      <Section show icon={arrowsRightLeft} title={<T id="transactions.title" />} class="col md:gap-8">
        <MemberTransactions
          member={props.member}
          transactions={query.data}
          createTransactionButton={
            <Show when={!isAuthenticatedMember(props.member)}>
              <CreateTransactionButton member={props.member} onCreated={() => query.refetch()} />
            </Show>
          }
        />
      </Section>
    </div>
  );
}

function Section(props: {
  show: unknown;
  icon: ComponentProps<typeof Icon>['path'];
  title: JSX.Element;
  class?: string;
  children: JSX.Element;
}) {
  return (
    <Show when={props.show}>
      <Card
        title={
          <div class="row gap-2 text-primary dark:text-blue-400">
            <div>
              <Icon path={props.icon} class="size-6" />
            </div>
            <h2>{props.title}</h2>
          </div>
        }
        class={clsx('max-w-4xl p-4 md:p-8', props.class)}
      >
        {props.children}
      </Card>
    </Show>
  );
}

function CreateTransactionButton(props: { member: Member; onCreated: () => Promise<unknown> }) {
  const [open, setOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} class="self-start">
        <T id="transactions.create" />
      </Button>

      <TransactionDialog
        open={open()}
        onClose={() => setOpen(false)}
        onCreated={props.onCreated}
        onCreate={(values) => api.createTransaction({ body: values })}
        initialValues={{
          memberId: props.member.id,
        }}
      />
    </>
  );
}

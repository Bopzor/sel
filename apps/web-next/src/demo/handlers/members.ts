import {
  listMemberActivityQuerySchema,
  listMembersQuerySchema,
  listMemberTransactionsQuerySchema,
  MembersSort,
  notificationDeliveryBodySchema,
  TransactionStatus,
  updateMemberProfileBodySchema,
  type Member,
  type MemberActivityCounts,
  type MemberActivityItem,
  type MemberTransactionStats,
} from '@sel/shared';

import { demo } from '../demo';

export const demoMemberRoutes = [
  demo.route('GET', '/members', ({ state, query }) => {
    const { sort } = listMembersQuerySchema.parse(query);

    const compare = {
      [MembersSort.firstName]: (a: demo.Member, b: demo.Member) => a.firstName.localeCompare(b.firstName),
      [MembersSort.lastName]: (a: demo.Member, b: demo.Member) => a.lastName.localeCompare(b.lastName),
      [MembersSort.membershipDate]: (a: demo.Member, b: demo.Member) =>
        b.membershipStartDate.localeCompare(a.membershipStartDate),
    };

    const members = sort ? state.members.toSorted(compare[sort]) : state.members;

    return demo.json(members.map(serializeMember));
  }),

  demo.route('GET', '/members/:memberId', ({ state, params }) => {
    return demo.json(serializeMember(demo.findMember(state, params.memberId ?? '')));
  }),

  demo.route('GET', '/members/:memberId/transactions', ({ state, params, query }) => {
    const { id: memberId } = demo.findMember(state, params.memberId ?? '');
    const { status, counterpartId, payerId, page, pageSize } = listMemberTransactionsQuerySchema.parse(query);

    const involves = (transaction: demo.Transaction, id: string) => {
      return transaction.payerId === id || transaction.recipientId === id;
    };

    const transactions = memberTransactions(state, memberId)
      .filter((transaction) => status === undefined || transaction.status === status)
      .filter((transaction) => counterpartId === undefined || involves(transaction, counterpartId))
      .filter((transaction) => payerId === undefined || transaction.payerId === payerId)
      .map((transaction) => demo.serializeTransaction(state, transaction))
      .toSorted(
        (a, b) =>
          Number(b.status === 'pending') - Number(a.status === 'pending') || b.date.localeCompare(a.date),
      );

    return page === undefined ? demo.json(transactions) : demo.paginated(transactions, { page, pageSize });
  }),

  demo.route('GET', '/members/:memberId/transactions/stats', ({ state, params }) => {
    const { id: memberId } = demo.findMember(state, params.memberId ?? '');

    const transactions = memberTransactions(state, memberId).filter(
      ({ status }) => status === TransactionStatus.completed,
    );

    const sum = (transactions: demo.Transaction[]) => {
      return transactions.reduce((total, { amount }) => total + amount, 0);
    };

    const partners = transactions.map(({ payerId, recipientId }) =>
      payerId === memberId ? recipientId : payerId,
    );

    return demo.json({
      given: sum(transactions.filter(({ payerId }) => payerId === memberId)),
      received: sum(transactions.filter(({ recipientId }) => recipientId === memberId)),
      count: transactions.length,
      partners: new Set(partners).size,
    } satisfies MemberTransactionStats);
  }),

  demo.route('GET', '/members/:memberId/activity', ({ state, params, query }) => {
    const { id: memberId } = demo.findMember(state, params.memberId ?? '');
    const { includeComments, ...page } = listMemberActivityQuerySchema.parse(query);

    const items = activity(state, memberId)
      .filter(({ type }) => includeComments || type !== 'comment')
      .toSorted((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

    return demo.paginated(items, page);
  }),

  demo.route('GET', '/members/:memberId/activity/counts', ({ state, params }) => {
    const { id: memberId } = demo.findMember(state, params.memberId ?? '');
    const items = activity(state, memberId);
    const count = (type: MemberActivityItem['type']) => items.filter((item) => item.type === type).length;

    return demo.json({
      requests: count('request'),
      requestAnswers: count('request-answer'),
      events: count('event'),
      eventParticipations: count('event-participation'),
      information: count('information'),
      comments: count('comment'),
    } satisfies MemberActivityCounts);
  }),

  demo.route('PUT', '/members/:memberId/profile', (context) => {
    const member = findAuthenticatedMember(context);
    const { avatarFileName, onboardingCompleted, bio, address, ...data } =
      updateMemberProfileBodySchema.parse(context.body);

    Object.assign(member, data);

    if (bio !== undefined) {
      member.bio = bio === null || bio === '' ? undefined : bio;
    }

    if (address !== undefined) {
      member.address = address ?? undefined;
    }

    if (avatarFileName !== undefined) {
      member.avatar = avatarFileName === null ? undefined : findAvatar(context.state, avatarFileName);
    }

    if (onboardingCompleted !== undefined) {
      member.onboardingCompleted = onboardingCompleted;
    }

    return demo.noContent();
  }),

  demo.route('PUT', '/members/:memberId/notification-delivery', (context) => {
    findAuthenticatedMember(context).notificationDelivery = notificationDeliveryBodySchema.parse(
      context.body,
    );

    return demo.noContent();
  }),
];

function serializeMember(member: demo.Member): Member {
  return {
    ...demo.serializeLightMember(member),
    ...demo.serializeMemberContact(member),
    bio: member.bio,
    address: member.address,
    membershipStartDate: member.membershipStartDate,
    balance: member.balance,
    interests: member.interests,
    committeeMember: member.committeeMember,
  };
}

function findAuthenticatedMember({ state, params, member }: demo.Context) {
  if (params.memberId !== member().id) {
    throw new demo.Error(403, 'Forbidden');
  }

  return demo.findMember(state, member().id);
}

function findAvatar(state: demo.State, fileName: string) {
  const file = state.files.find(({ name }) => name === fileName) ?? demo.notFound('File');

  if (!file.mimetype.startsWith('image/')) {
    throw new demo.Error(400, 'The avatar must be an image');
  }

  return file.name;
}

function memberTransactions(state: demo.State, memberId: string) {
  return state.transactions.filter(
    ({ payerId, recipientId }) => payerId === memberId || recipientId === memberId,
  );
}

function activity(state: demo.State, memberId: string): MemberActivityItem[] {
  const find = <T extends { id: string }>(items: T[], id: string) =>
    items.find((item) => item.id === id) ?? demo.notFound(id);
  const requestEntity = ({ id, title }: demo.Request) => ({ type: 'request' as const, id, title });
  const eventEntity = ({ id, title, date }: demo.Event) => ({ type: 'event' as const, id, title, date });
  const informationEntity = ({ id, title }: demo.Information) => ({
    type: 'information' as const,
    id,
    title,
  });

  const commentEntity = ({ entityType, entityId }: demo.Comment) => {
    switch (entityType) {
      case 'request':
        return requestEntity(find(state.requests, entityId));
      case 'event':
        return eventEntity(find(state.events, entityId));
      case 'information':
        return informationEntity(find(state.information, entityId));
    }
  };

  return [
    ...state.requests
      .filter(({ requesterId }) => requesterId === memberId)
      .map((request) => ({
        type: 'request' as const,
        id: request.id,
        date: request.date,
        entity: requestEntity(request),
      })),

    ...state.requestAnswers
      .filter((answer) => answer.memberId === memberId && answer.answer === 'positive')
      .map((answer) => ({
        type: 'request-answer' as const,
        id: answer.id,
        date: answer.date,
        entity: requestEntity(find(state.requests, answer.requestId)),
      })),

    ...state.events
      .filter(({ organizerId }) => organizerId === memberId)
      .map((event) => ({
        type: 'event' as const,
        id: event.id,
        date: event.createdAt,
        entity: eventEntity(event),
      })),

    ...state.eventParticipations
      .filter((participation) => participation.memberId === memberId && participation.participation === 'yes')
      .map((participation) => ({
        type: 'event-participation' as const,
        id: participation.id,
        date: participation.date,
        entity: eventEntity(find(state.events, participation.eventId)),
      })),

    ...state.information
      .filter(({ authorId }) => authorId === memberId)
      .map((information) => ({
        type: 'information' as const,
        id: information.id,
        date: information.publishedAt,
        entity: informationEntity(information),
      })),

    ...state.comments
      .filter(({ authorId }) => authorId === memberId)
      .map((comment) => ({
        type: 'comment' as const,
        id: comment.id,
        date: comment.date,
        entity: commentEntity(comment),
        body: comment.message.body,
      })),

    ...memberTransactions(state, memberId)
      .filter(({ status }) => status === TransactionStatus.completed)
      .map((transaction) => {
        const { amount, description, payer, recipient, date } = demo.serializeTransaction(state, transaction);

        return {
          type: 'transaction' as const,
          id: transaction.id,
          date,
          amount,
          description,
          payer,
          recipient,
        };
      }),
  ];
}

import { defineRelations } from 'drizzle-orm';

import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  attachments: {
    message: r.one.messages({
      from: r.attachments.messageId,
      to: r.messages.id,
      optional: false,
    }),
    file: r.one.files({
      from: r.attachments.fileId,
      to: r.files.id,
      optional: false,
    }),
  },

  comments: {
    author: r.one.members({
      from: r.comments.authorId,
      to: r.members.id,
      optional: false,
    }),
    request: r.one.requests({
      from: r.comments.requestId,
      to: r.requests.id,
    }),
    event: r.one.events({
      from: r.comments.eventId,
      to: r.events.id,
    }),
    information: r.one.information({
      from: r.comments.informationId,
      to: r.information.id,
    }),
    message: r.one.messages({
      from: r.comments.messageId,
      to: r.messages.id,
      optional: false,
    }),
  },

  eventParticipations: {
    event: r.one.events({
      from: r.eventParticipations.eventId,
      to: r.events.id,
      optional: false,
    }),
    member: r.one.members({
      from: r.eventParticipations.participantId,
      to: r.members.id,
      optional: false,
    }),
  },

  events: {
    message: r.one.messages({
      from: r.events.messageId,
      to: r.messages.id,
      optional: false,
    }),
    organizer: r.one.members({
      from: r.events.organizerId,
      to: r.members.id,
      optional: false,
    }),
    participants: r.many.eventParticipations({
      from: r.events.id,
      to: r.eventParticipations.eventId,
    }),
    comments: r.many.comments({
      from: r.events.id,
      to: r.comments.eventId,
    }),
  },

  information: {
    author: r.one.members({
      from: r.information.authorId,
      to: r.members.id,
    }),
    message: r.one.messages({
      from: r.information.messageId,
      to: r.messages.id,
      optional: false,
    }),
    comments: r.many.comments({
      from: r.information.id,
      to: r.comments.informationId,
    }),
  },

  interests: {
    image: r.one.files({
      from: r.interests.imageId,
      to: r.files.id,
    }),
    membersInterests: r.many.membersInterests({
      from: r.interests.id,
      to: r.membersInterests.interestId,
    }),
  },

  memberDevices: {
    member: r.one.members({
      from: r.memberDevices.memberId,
      to: r.members.id,
      optional: false,
    }),
  },

  members: {
    avatar: r.one.files({
      from: r.members.avatarId,
      to: r.files.id,
    }),
    memberInterests: r.many.membersInterests({
      from: r.members.id,
      to: r.membersInterests.memberId,
    }),
    devices: r.many.memberDevices({
      from: r.members.id,
      to: r.memberDevices.memberId,
    }),
  },

  membersInterests: {
    member: r.one.members({
      from: r.membersInterests.memberId,
      to: r.members.id,
      optional: false,
    }),
    interest: r.one.interests({
      from: r.membersInterests.interestId,
      to: r.interests.id,
      optional: false,
    }),
  },

  messages: {
    attachments: r.many.attachments({
      from: r.messages.id,
      to: r.attachments.messageId,
    }),
  },

  requestAnswers: {
    request: r.one.requests({
      from: r.requestAnswers.requestId,
      to: r.requests.id,
      optional: false,
    }),
    member: r.one.members({
      from: r.requestAnswers.memberId,
      to: r.members.id,
      optional: false,
    }),
  },

  requests: {
    requester: r.one.members({
      from: r.requests.requesterId,
      to: r.members.id,
      optional: false,
    }),
    message: r.one.messages({
      from: r.requests.messageId,
      to: r.messages.id,
      optional: false,
    }),
    answers: r.many.requestAnswers({
      from: r.requests.id,
      to: r.requestAnswers.requestId,
    }),
    comments: r.many.comments({
      from: r.requests.id,
      to: r.comments.requestId,
    }),
    transactions: r.many.transactions({
      from: r.requests.id,
      to: r.transactions.requestId,
    }),
  },

  tokens: {
    member: r.one.members({
      from: r.tokens.memberId,
      to: r.members.id,
      optional: false,
    }),
  },

  transactions: {
    payer: r.one.members({
      from: r.transactions.payerId,
      to: r.members.id,
      optional: false,
    }),
    recipient: r.one.members({
      from: r.transactions.recipientId,
      to: r.members.id,
      optional: false,
    }),
    creator: r.one.members({
      from: r.transactions.creatorId,
      to: r.members.id,
      optional: false,
    }),
    request: r.one.requests({
      from: r.transactions.requestId,
      to: r.requests.id,
    }),
    event: r.one.events({
      from: r.transactions.eventId,
      to: r.events.id,
    }),
  },
}));

import { createDate, createFactory, createId } from '@sel/utils';

import { type Address } from './address';
import { type AdminMember } from './admin-member';
import { type AuthenticatedMember } from './authenticated-member';
import { type Comment, type CommentAuthor } from './comment';
import { type Config } from './config';
import { type Document } from './documents';
import { EventKind, type Event, type EventsListItem } from './event';
import { type FeedEvent, type FeedInformation, type FeedRequest } from './feed';
import { type Information } from './information';
import { type Interest } from './interest';
import { type LightMember, type Member, MemberStatus } from './member';
import { type MemberActivityItem } from './member-activity';
import { type Attachment, type Message } from './message';
import { type Request, type RequestListItem, RequestStatus } from './request';
import { type Transaction, TransactionStatus } from './transaction';

export const createConfig = createFactory<Config>(() => ({
  maintenance: false,
  letsName: '',
  place: '',
  contactEmail: '',
  currency: '',
  currencyPlural: '',
  logoUrl: '',
  theme: {
    primaryColor: '',
    accentColor: '',
  },
  map: {
    center: [0, 0],
    zoom: 0,
  },
}));

export const createAddress = createFactory<Address>(() => ({
  line1: '',
  postalCode: '',
  city: '',
  country: '',
}));

export const createMessage = createFactory<Message>(() => ({
  body: '',
  attachments: [],
}));

export const createAttachment = createFactory<Attachment>(() => ({
  fileId: createId(),
  name: '',
  originalName: '',
  mimetype: '',
}));

export const createLightMember = createFactory<LightMember>(() => ({
  id: createId(),
  firstName: '',
  lastName: '',
  number: 0,
}));

export const createMember = createFactory<Member>(() => ({
  id: createId(),
  firstName: '',
  lastName: '',
  number: 0,
  membershipStartDate: createDate().toISOString(),
  balance: 0,
  interests: [],
  committeeMember: false,
}));

export const createAuthenticatedMember = createFactory<AuthenticatedMember>(() => ({
  ...createMember(),
  email: '',
  emailVisible: false,
  phoneNumberVisible: false,
  onboardingCompleted: false,
  notificationDelivery: {
    email: false,
    push: false,
  },
}));

export const createAdminMember = createFactory<AdminMember>(() => ({
  id: createId(),
  status: MemberStatus.active,
  firstName: '',
  lastName: '',
  number: 0,
  email: '',
  balance: 0,
}));

export const createMemberActivityItem = createFactory<MemberActivityItem>(() => ({
  id: createId(),
  date: createDate().toISOString(),
  type: 'request',
  entity: { type: 'request', id: createId(), title: '' },
}));

export const createTransaction = createFactory<Transaction>(() => ({
  id: createId(),
  status: TransactionStatus.pending,
  amount: 0,
  description: '',
  payer: createLightMember(),
  recipient: createLightMember(),
  date: createDate().toISOString(),
}));

export const createRequest = createFactory<Request>(() => ({
  id: createId(),
  status: RequestStatus.pending,
  date: createDate().toISOString(),
  requester: createLightMember(),
  title: '',
  message: createMessage(),
  hasTransactions: false,
  answers: [],
}));

export const createRequestListItem = createFactory<RequestListItem>(() => ({
  id: createId(),
  status: RequestStatus.pending,
  date: createDate().toISOString(),
  requester: createLightMember(),
  title: '',
  message: createMessage(),
  positiveAnswersCount: 0,
}));

export const createEvent = createFactory<Event>(() => ({
  id: createId(),
  title: '',
  message: createMessage(),
  kind: EventKind.internal,
  committeeMeeting: false,
  organizer: createLightMember(),
  participants: [],
}));

export const createEventsListItem = createFactory<EventsListItem>(() => ({
  id: createId(),
  title: '',
  kind: EventKind.internal,
  committeeMeeting: false,
  organizer: createLightMember(),
  message: createMessage(),
  participantsCount: 0,
}));

export const createInformation = createFactory<Information>(() => ({
  id: createId(),
  title: '',
  message: createMessage(),
  publishedAt: createDate().toISOString(),
}));

export const createInterest = createFactory<Interest>(() => ({
  id: createId(),
  label: '',
  description: '',
  image: '',
  members: [],
}));

export const createCommentAuthor = createFactory<CommentAuthor>(() => ({
  id: createId(),
  firstName: '',
  lastName: '',
}));

export const createComment = createFactory<Comment>(() => ({
  id: createId(),
  author: createCommentAuthor(),
  date: createDate().toISOString(),
  message: createMessage(),
}));

export const createFeedEvent = createFactory<FeedEvent>(() => ({
  id: createId(),
  title: '',
  message: createMessage(),
  organizer: createLightMember(),
  publishedAt: createDate().toISOString(),
}));

export const createFeedRequest = createFactory<FeedRequest>(() => ({
  id: createId(),
  status: RequestStatus.pending,
  requester: createLightMember(),
  title: '',
  message: createMessage(),
  publishedAt: createDate().toISOString(),
}));

export const createFeedInformation = createFactory<FeedInformation>(() => ({
  id: createId(),
  title: '',
  message: createMessage(),
  publishedAt: createDate().toISOString(),
}));

export const createDocument = createFactory<Document>(() => ({
  url: '',
  name: '',
  size: 0,
  updated: createDate().toISOString(),
}));

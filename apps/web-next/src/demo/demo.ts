import type {
  Address,
  AuthenticatedMember,
  CommentEntityType,
  Config,
  DocumentsGroup,
  EventKind,
  File,
  LightMember,
  Member,
  MemberInterest,
  Message,
  RequestStatus,
  Transaction,
  TransactionStatus,
} from '@sel/shared';
import { pick } from '@sel/utils';

import type { HttpMethod } from 'src/app/api';

// The types share the name of the object below: demo.State, demo.Context…
// oxlint-disable-next-line typescript/no-namespace
export declare namespace demo {
  type State = {
    config: Config;
    sessionMemberId?: string;
    /** The member who asked for a sign-in code: any code signs them in. */
    authenticationMemberId?: string;
    members: Member[];
    requests: Request[];
    requestAnswers: RequestAnswer[];
    events: Event[];
    eventParticipations: EventParticipation[];
    information: Information[];
    interests: Interest[];
    memberInterests: MemberInterest[];
    comments: Comment[];
    transactions: Transaction[];
    files: File[];
    documents: DocumentsGroup[];
  };

  // The interests are found in State.memberInterests.
  type Member = Omit<AuthenticatedMember, 'interests'>;

  type Request = {
    id: string;
    status: RequestStatus;
    date: string;
    requesterId: string;
    title: string;
    message: Message;
  };

  type RequestAnswer = {
    id: string;
    requestId: string;
    memberId: string;
    answer: 'positive' | 'negative';
    date: string;
  };

  type Event = {
    id: string;
    title: string;
    message: Message;
    kind: EventKind;
    committeeMeeting: boolean;
    date?: string;
    location?: Address;
    organizerId: string;
    createdAt: string;
  };

  type EventParticipation = {
    id: string;
    eventId: string;
    memberId: string;
    participation: 'yes' | 'no';
    date: string;
  };

  type Information = {
    id: string;
    title: string;
    message: Message;
    /** Published by the LETS when unset. */
    authorId?: string;
    publishedAt: string;
  };

  type Interest = {
    id: string;
    label: string;
    description: string;
    /** The name of the file. */
    image?: string;
  };

  type MemberInterest = {
    id: string;
    interestId: string;
    memberId: string;
    description?: string;
  };

  type Comment = {
    id: string;
    entityType: CommentEntityType;
    entityId: string;
    authorId: string;
    date: string;
    message: Message;
  };

  type Transaction = {
    id: string;
    status: TransactionStatus;
    amount: number;
    description: string;
    payerId: string;
    recipientId: string;
    payerComment?: string;
    recipientComment?: string;
    requestId?: string;
    createdAt: string;
    completedAt?: string;
  };

  type Context = {
    state: State;
    params: Record<string, string | undefined>;
    query: Record<string, string>;
    body: unknown;
    member: () => Member;
  };

  type Route = {
    method: HttpMethod;
    pattern: URLPattern;
    handler: (context: Context) => Response | Promise<Response>;
  };
}

class DemoError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function notFound(entity: string): never {
  throw new DemoError(404, `${entity} not found`);
}

function json(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);

  headers.set('Content-Type', 'application/json');

  return new Response(JSON.stringify(body), { ...init, headers });
}

function findMember(state: demo.State, memberId: string) {
  return state.members.find(({ id }) => id === memberId) ?? notFound('Member');
}

function serializeLightMember(member: demo.Member): LightMember {
  return pick(member, ['id', 'firstName', 'lastName', 'number', 'avatar']);
}

export const demo = {
  Error: DemoError,
  notFound,
  json,

  route: (method: HttpMethod, pathname: string, handler: demo.Route['handler']): demo.Route => {
    return { method, pattern: new URLPattern({ pathname }), handler };
  },

  paginated: <T>(items: T[], { page, pageSize }: { page: number; pageSize: number }) => {
    return json(items.slice((page - 1) * pageSize, page * pageSize), {
      headers: { 'X-Pagination-Total': String(items.length) },
    });
  },

  created: (id: string) => {
    return new Response(id, { status: 201, headers: { 'Content-Type': 'text/plain' } });
  },

  noContent: () => {
    return new Response(null, { status: 204 });
  },

  findMember,

  serializeLightMember,

  serializeMemberInterests: (state: demo.State, memberId: string): MemberInterest[] => {
    return state.memberInterests
      .filter((memberInterest) => memberInterest.memberId === memberId)
      .map((memberInterest) => {
        const interest =
          state.interests.find(({ id }) => id === memberInterest.interestId) ?? notFound('Interest');

        return {
          id: memberInterest.id,
          interestId: interest.id,
          label: interest.label,
          description: memberInterest.description,
          image: interest.image,
        };
      })
      .toSorted((a, b) => a.label.localeCompare(b.label));
  },

  serializeMemberContact: (member: demo.Member): Pick<Member, 'email' | 'phoneNumber'> => {
    return {
      email: member.emailVisible ? member.email : undefined,
      phoneNumber: member.phoneNumberVisible ? member.phoneNumber : undefined,
    };
  },

  serializeTransaction: (state: demo.State, transaction: demo.Transaction): Transaction => {
    const request = state.requests.find(({ id }) => id === transaction.requestId);

    return {
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      description: transaction.description,
      payer: serializeLightMember(findMember(state, transaction.payerId)),
      recipient: serializeLightMember(findMember(state, transaction.recipientId)),
      payerComment: transaction.payerComment,
      recipientComment: transaction.recipientComment,
      request: request && { id: request.id, title: request.title },
      date: transaction.completedAt ?? transaction.createdAt,
    };
  },

  createMessage: (state: demo.State, body: string, fileIds: string[]): Message => {
    return {
      body,
      attachments: fileIds.map((fileId) => {
        const file = state.files.find(({ id }) => id === fileId) ?? notFound('File');

        return { fileId, name: file.name, originalName: file.originalName, mimetype: file.mimetype };
      }),
    };
  },

  matchesSearch: (search: string, title: string, message: Message) => {
    const text = new DOMParser().parseFromString(message.body, 'text/html').body.textContent;

    return [title, text].some((value) => value.toLowerCase().includes(search.toLowerCase()));
  },
};

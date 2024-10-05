import { Member, MembersSort, Transaction } from '@sel/shared';
import { injectableClass } from 'ditox';

import { FetchError, FetcherPort } from '../../infrastructure/fetcher';
import { TOKENS } from '../../tokens';

export interface MemberApi {
  listMembers(sort?: MembersSort): Promise<Member[]>;
  getMember(memberId: string): Promise<Member | undefined>;
  listMemberTransactions(memberId: string): Promise<Transaction[]>;
}

export class FetchMemberApi implements MemberApi {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: FetcherPort) {}

  async listMembers(sort?: MembersSort): Promise<Member[]> {
    let endpoint = '/members';
    const search = new URLSearchParams();

    if (sort) {
      search.set('sort', sort);
    }

    if (search.size > 0) {
      endpoint += `?${search}`;
    }

    return this.fetcher.get<Member[]>(endpoint).body();
  }

  async getMember(memberId: string): Promise<Member | undefined> {
    return this.fetcher
      .get<Member>(`/members/${memberId}`)
      .body()
      .catch((error) => {
        if (FetchError.is(error) && error.status === 404) {
          return undefined;
        }

        throw error;
      });
  }

  async listMemberTransactions(memberId: string): Promise<Transaction[]> {
    return this.fetcher.get<Transaction[]>(`/members/${memberId}/transactions`).body();
  }
}

export class StubMemberApi implements MemberApi {
  members = new Array<Member>();
  member: Member | undefined;

  async listMembers(): Promise<Member[]> {
    return this.members;
  }

  async getMember(): Promise<Member | undefined> {
    return this.member;
  }

  async listMemberTransactions(): Promise<Transaction[]> {
    return [];
  }
}

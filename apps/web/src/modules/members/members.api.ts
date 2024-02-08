import { fakerFR as faker } from '@faker-js/faker';
import { Member, MembersSort } from '@sel/shared';
import { createId } from '@sel/utils';
import { injectableClass } from 'ditox';

import { FetchError, FetcherPort } from '../../fetcher';
import { TOKENS } from '../../tokens';

export interface MembersApi {
  listMembers(sort?: MembersSort): Promise<Member[]>;
  getMember(memberId: string): Promise<Member | undefined>;
}

export class FetchMembersApi implements MembersApi {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: FetcherPort) {}

  async listMembers(sort?: MembersSort): Promise<Member[]> {
    let endpoint = '/api/members';
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
      .get<Member>(`/api/members/${memberId}`)
      .body()
      .catch((error) => {
        if (FetchError.is(error) && error.status === 404) {
          return undefined;
        }

        throw error;
      });
  }
}

export class StubMembersApi implements MembersApi {
  members = new Array<Member>();
  member: Member | undefined;

  async listMembers(): Promise<Member[]> {
    return this.members;
  }

  async getMember(): Promise<Member | undefined> {
    return this.member;
  }
}

export class FakeMembersApi extends StubMembersApi {
  constructor() {
    super();

    this.members = [this.fakeMember(), this.fakeMember(), this.fakeMember()];
    this.member = this.fakeMember();
  }

  private fakeMember(): Member {
    return {
      id: createId(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      membershipStartDate: faker.date.past().toISOString(),
      phoneNumbers: [],
      bio: faker.lorem.paragraphs(),
    };
  }
}

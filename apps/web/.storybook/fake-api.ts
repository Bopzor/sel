import { fakerFR as faker } from '@faker-js/faker';
import { Interest, Member, Request, RequestStatus, createAuthenticatedMember } from '@sel/shared';
import { createFactory, createId } from '@sel/utils';
import { StubSessionApi } from '../src/session.api';
import { StubMemberApi } from '../src/modules/members/members.api';
import { StubRequestsApi } from '../src/modules/requests/requests.api';
import { StubInterestApi } from '../src/modules/interests/interests-api';

export class FakeSessionApi extends StubSessionApi {
  constructor() {
    super();

    this.authenticatedMember = createAuthenticatedMember({
      id: createId(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    });
  }
}

export class FakeMemberApi extends StubMemberApi {
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
      interests: [],
    };
  }
}

export class FakeRequestsApi extends StubRequestsApi {
  constructor() {
    super();

    this.requests = [
      this.createFakeRequest({ status: RequestStatus.pending }),
      this.createFakeRequest({ status: RequestStatus.fulfilled }),
      this.createFakeRequest({ status: RequestStatus.canceled }),
    ];

    this.request = this.createFakeRequest();
  }

  private createFakeRequest = createFactory<Request>(() => ({
    id: 'requestId',
    status: RequestStatus.pending,
    date: faker.date.past().toISOString(),
    requester: {
      ...fakeMember(),
      phoneNumbers: [{ number: faker.string.numeric({ length: 10 }), visible: true }],
      email: faker.internet.email(),
    },
    title: faker.word.words({ count: { min: 1, max: 10 } }),
    body: lorem(),
    answers: [
      {
        id: createId(),
        answer: 'positive',
        member: fakeMember(),
      },
      {
        id: createId(),
        answer: 'negative',
        member: fakeMember(),
      },
    ],
    comments: [
      {
        id: createId(),
        author: fakeMember(),
        date: faker.date.past().toISOString(),
        body: lorem(),
      },
    ],
  }));
}

export class FakeInterestApi extends StubInterestApi {
  constructor() {
    super();

    this.interests = [
      this.createFakeInterest({ label: 'Randonnée', description: 'Balades à pieds.' }),
      this.createFakeInterest({ label: 'Musique', description: "Concerts, pratique d'un instrument." }),
      this.createFakeInterest({
        label: 'Informatique',
        description: 'Logiciel libre, développement informatique.',
      }),
      this.createFakeInterest({ label: 'Jeux de société', description: 'Après midi jeux de société.' }),
      this.createFakeInterest({ label: 'Cuisine' }),
      this.createFakeInterest({
        label: 'Bricolage',
        description: "Travaux, réparations, construction à partir de récup'.",
      }),
      this.createFakeInterest({
        label: 'Jardin',
        description: 'Potager, plantes.',
      }),
    ];
  }

  private createFakeInterest = createFactory<Interest>(() => ({
    id: createId(),
    label: '',
    description: '',
    members: [],
  }));
}

const fakeMember = () => ({
  id: createId(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
});

const lorem = () => {
  return faker.lorem
    .paragraphs({ min: 1, max: 7 })
    .split('\n')
    .map((par) => `<p>${par}</p>`)
    .join('\n');
};

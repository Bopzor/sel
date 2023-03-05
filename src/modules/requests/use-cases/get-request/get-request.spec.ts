import { InMemoryDatabase } from '../../../../app/in-memory-database';
import { Timestamp } from '../../../../common/timestamp.value-object';
import { Member } from '../../../members/entities/member.entity';
import { Request } from '../../entities/request.entity';
import { InMemoryRequestRepository } from '../../in-memory-request.repository';

import { GetRequestHandler, GetRequestQuery } from './get-request';
import { GetRequestResult } from './get-request-result';

describe('GetRequest', () => {
  let database: InMemoryDatabase;
  let requestRepository: InMemoryRequestRepository;
  let getRequestHandler: GetRequestHandler;

  beforeEach(() => {
    database = new InMemoryDatabase();
    requestRepository = new InMemoryRequestRepository(database);
    getRequestHandler = new GetRequestHandler(requestRepository);

    database.setEntity(
      new Member({
        id: 'requesterId',
        email: 'requester@domain.tld',
        firstName: '',
        lastName: '',
      })
    );
  });

  it("retrieves an existing request's details", async () => {
    const creationDate = Timestamp.from('2022-01-01');
    const lastEditionDate = Timestamp.from('2022-01-02');

    const request = new Request({
      id: 'id',
      requesterId: 'requesterId',
      title: 'title',
      description: 'description',
      creationDate,
      lastEditionDate,
    });

    requestRepository.add(request);

    const query: GetRequestQuery = {
      id: 'id',
    };

    await expect(getRequestHandler.handle(query)).resolves.toEqual<GetRequestResult>({
      id: 'id',
      requester: {
        id: 'requesterId',
        name: ' ',
        email: 'requester@domain.tld',
      },
      title: 'title',
      description: 'description',
      creationDate: creationDate.toString(),
      lastEditionDate: lastEditionDate.toString(),
    });
  });

  it('returns undefined when the request does not exist', async () => {
    const query: GetRequestQuery = {
      id: 'id',
    };

    await expect(getRequestHandler.handle(query)).resolves.toBeUndefined();
  });
});

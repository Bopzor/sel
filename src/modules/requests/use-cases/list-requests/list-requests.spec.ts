import { InMemoryDatabaseImpl } from '../../../../app/in-memory-database';
import { Timestamp } from '../../../../common/timestamp.value-object';
import { Member } from '../../../members/entities/member.entity';
import { Request } from '../../entities/request.entity';
import { create } from '../../factories';
import { InMemoryRequestRepository } from '../../in-memory-request.repository';

import { ListRequestsHandler } from './list-requests';
import { ListRequestsResult } from './list-requests-result';

describe('ListRequests', () => {
  let database: InMemoryDatabaseImpl;
  let requestRepository: InMemoryRequestRepository;
  let listRequestsHandler: ListRequestsHandler;

  beforeEach(() => {
    database = new InMemoryDatabaseImpl();
    requestRepository = new InMemoryRequestRepository(database);
    listRequestsHandler = new ListRequestsHandler(requestRepository);

    database.setEntity(
      new Member({
        id: 'requesterId',
        email: 'requester@domain.tld',
        firstName: '',
        lastName: '',
      })
    );
  });

  it('retrieves the list of requests', async () => {
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

    await expect(listRequestsHandler.handle()).resolves.toEqual<ListRequestsResult>([
      {
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
      },
    ]);
  });

  it('retrieves the list of requests matching a search query', async () => {
    requestRepository.add(create.request({ description: 'cat', requesterId: 'requesterId' }));
    requestRepository.add(create.request({ description: 'bat', requesterId: 'requesterId' }));

    await expect(listRequestsHandler.handle({ search: 'cat' })).resolves.toEqual<ListRequestsResult>([
      expect.objectContaining({
        description: 'cat',
      }),
    ]);
  });
});

import { Timestamp } from '../../../../common/timestamp.value-object';
import { Request } from '../../entities/request.entity';
import { InMemoryRequestRepository } from '../../in-memory-request.repository';

import { ListRequestsHandler } from './list-requests';
import { ListRequestsResult } from './list-requests-result';

describe('ListRequests', () => {
  let requestRepository: InMemoryRequestRepository;
  let listRequestsHandler: ListRequestsHandler;

  beforeEach(() => {
    requestRepository = new InMemoryRequestRepository();
    listRequestsHandler = new ListRequestsHandler(requestRepository);
  });

  it('retrieves the list of requests', async () => {
    const creationDate = Timestamp.from('2022-01-01');
    const lastEditionDate = Timestamp.from('2022-01-02');

    const request = new Request({
      id: 'id',
      title: 'title',
      description: 'description',
      creationDate,
      lastEditionDate,
    });

    requestRepository.add(request);

    await expect(listRequestsHandler.handle()).resolves.toEqual<ListRequestsResult>([
      {
        id: 'id',
        title: 'title',
        description: 'description',
        creationDate: creationDate.toString(),
        lastEditionDate: lastEditionDate.toString(),
      },
    ]);
  });
});

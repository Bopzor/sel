import { Request } from '../../entities/request.entity';
import { InMemoryRequestRepository } from '../../in-memory-request.repository';

import { ListRequestsHandler } from './list-requests';

describe('ListRequests', () => {
  let requestRepository: InMemoryRequestRepository;
  let listRequestsHandler: ListRequestsHandler;

  beforeEach(() => {
    requestRepository = new InMemoryRequestRepository();
    listRequestsHandler = new ListRequestsHandler(requestRepository);
  });

  it('retrieves the list of requests', async () => {
    requestRepository.add(new Request({ id: 'id', title: 'title', description: 'description' }));

    await expect(listRequestsHandler.handle()).resolves.toEqual([
      {
        id: 'id',
        title: 'title',
        description: 'description',
      },
    ]);
  });
});

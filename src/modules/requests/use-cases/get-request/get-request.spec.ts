import { Request } from '../../entities/request.entity';
import { InMemoryRequestRepository } from '../../in-memory-request.repository';

import { GetRequestHandler, GetRequestQuery } from './get-request';

describe('GetRequest', () => {
  let requestRepository: InMemoryRequestRepository;
  let getRequestHandler: GetRequestHandler;

  beforeEach(() => {
    requestRepository = new InMemoryRequestRepository();
    getRequestHandler = new GetRequestHandler(requestRepository);
  });

  it("retrieves an existing request's details", async () => {
    requestRepository.add(new Request({ id: 'id', title: 'title', description: 'description' }));

    const query: GetRequestQuery = {
      id: 'id',
    };

    await expect(getRequestHandler.handle(query)).resolves.toEqual({
      id: 'id',
      title: 'title',
      description: 'description',
    });
  });

  it('returns undefined when the request does not exist', async () => {
    const query: GetRequestQuery = {
      id: 'id',
    };

    await expect(getRequestHandler.handle(query)).resolves.toBeUndefined();
  });
});

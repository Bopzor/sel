import { injected } from 'brandi';

import { OrmType } from '../../../../api/persistence/types';
import { TOKENS } from '../../../../api/tokens';
import { Timestamp } from '../../../../common/timestamp.value-object';
import { SqlMemberRepository } from '../../../members/api/repositories/sql-member.repository';
import { Request } from '../../entities/request.entity';
import { GetRequestResult } from '../../use-cases/get-request/get-request-result';
import { SqlRequestEntity } from '../entities/sql-request.entity';

import { RequestRepository } from './request.repository';

export class SqlRequestRepository implements RequestRepository {
  constructor(private readonly orm: OrmType) {}

  get repository() {
    return this.orm.em.getRepository(SqlRequestEntity);
  }

  async listRequests(search?: string): Promise<GetRequestResult[]> {
    const getRequests = () => {
      if (!search) {
        return this.repository.findAll();
      }

      const $ilike = `%${search}%`;

      return this.repository.find({
        $or: [{ title: { $ilike } }, { description: { $ilike } }],
      });
    };

    const sqlRequests = await getRequests();

    return sqlRequests.map(this.requestToResult);
  }

  async getRequest(requestId: string): Promise<GetRequestResult | undefined> {
    const sqlRequest = await this.repository.findOne(requestId);

    if (sqlRequest) {
      return this.requestToResult(sqlRequest);
    }
  }

  async findById(requestId: string): Promise<Request | undefined> {
    const sqlRequest = await this.repository.findOne(requestId);

    if (!sqlRequest) {
      return;
    }

    return new Request({
      id: sqlRequest.id,
      requesterId: sqlRequest.requester.id,
      title: sqlRequest.title,
      description: sqlRequest.description,
      creationDate: Timestamp.from(sqlRequest.creationDate),
      lastEditionDate: Timestamp.from(sqlRequest.lastEditionDate),
    });
  }

  async save(request: Request): Promise<void> {
    await this.repository.upsert(new SqlRequestEntity(this.orm.em, request));
  }

  private requestToResult = (request: SqlRequestEntity): GetRequestResult => ({
    id: request.id,
    requester: SqlMemberRepository.memberToResult(request.requester),
    title: request.title,
    description: request.description,
    creationDate: request.creationDate.toISOString(),
    lastEditionDate: request.lastEditionDate.toISOString(),
  });
}

injected(SqlRequestRepository, TOKENS.orm);

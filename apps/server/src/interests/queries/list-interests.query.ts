import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { QueryHandler } from '../../infrastructure/cqs/query-handler';
import { Database } from '../../persistence/database';
import { TOKENS } from '../../tokens';

export type ListInterestsQuery = {
  //
};

export type ListInterestsQueryResult = shared.Interest[];

export class ListInterests implements QueryHandler<ListInterestsQuery, ListInterestsQueryResult> {
  static inject = injectableClass(this, TOKENS.database);

  constructor(private readonly database: Database) {}

  async handle(): Promise<ListInterestsQueryResult> {
    const interests = await this.database.db.query.interests.findMany({
      orderBy: (interests, { asc }) => asc(interests.label),
      with: {
        membersInterests: {
          with: {
            member: true,
          },
        },
      },
    });

    return interests.map(
      (interest): shared.Interest => ({
        id: interest.id,
        label: interest.label,
        description: interest.description,
        members: interest.membersInterests.map((memberInterest) => ({
          id: memberInterest.member.id,
          firstName: memberInterest.member.firstName,
          lastName: memberInterest.member.lastName,
          description: memberInterest.description ?? undefined,
        })),
      }),
    );
  }
}

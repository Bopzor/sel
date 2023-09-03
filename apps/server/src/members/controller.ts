import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';

import { TOKENS } from '../tokens';

import { MembersRepository } from './members-repository';

export class MembersController {
  readonly router = Router();

  static inject = injectableClass(this, TOKENS.membersRepository);

  constructor(private readonly membersRepository: MembersRepository) {
    this.router.get('/', this.listMembers);
    this.router.get('/:memberId', this.getMember);
  }

  listMembers: RequestHandler<never, shared.Member[]> = async (req, res) => {
    res.json(await this.membersRepository.listMembers());
  };

  getMember: RequestHandler<{ memberId: string }, shared.Member> = async (req, res) => {
    res.json(await this.membersRepository.getMember(req.params.memberId));
  };
}

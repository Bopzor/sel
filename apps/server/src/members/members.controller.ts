import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';
import { z } from 'zod';

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
    const schema = z.object({
      sort: z.nativeEnum(shared.MembersSort).optional(),
    });

    const { sort } = schema.parse(req.query);

    res.json(await this.membersRepository.listMembers(sort ?? shared.MembersSort.firstName));
  };

  getMember: RequestHandler<{ memberId: string }, shared.Member> = async (req, res) => {
    const member = await this.membersRepository.getMember(req.params.memberId);

    if (!member) {
      return res.status(404).end();
    }

    res.json(member);
  };
}

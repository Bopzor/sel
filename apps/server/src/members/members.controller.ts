import { Member, MembersSort } from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';
import { z } from 'zod';

import { SessionProvider } from '../session/session.provider';
import { TOKENS } from '../tokens';

import { MembersRepository } from './members.repository';

export class MembersController {
  readonly router = Router();

  static inject = injectableClass(this, TOKENS.sessionProvider, TOKENS.membersRepository);

  constructor(
    private readonly sessionProvider: SessionProvider,
    private readonly membersRepository: MembersRepository
  ) {
    this.router.use(this.authenticated);
    this.router.get('/', this.listMembers);
    this.router.get('/:memberId', this.getMember);
  }

  authenticated: RequestHandler = (req, res, next) => {
    this.sessionProvider.getMember();
    next();
  };

  listMembers: RequestHandler<never, Member[]> = async (req, res) => {
    const schema = z.object({
      sort: z.nativeEnum(MembersSort).optional(),
    });

    const { sort } = schema.parse(req.query);

    res.json(await this.membersRepository.listMembers(sort ?? MembersSort.firstName));
  };

  getMember: RequestHandler<{ memberId: string }, Member> = async (req, res) => {
    const member = await this.membersRepository.getMember(req.params.memberId);

    if (!member) {
      return res.status(404).end();
    }

    res.json(member);
  };
}

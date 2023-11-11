import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';
import { z } from 'zod';

import { AuthorizationError } from '../authorization-error';
import { SessionProvider } from '../session/session.provider';
import { TOKENS } from '../tokens';

import { MembersRepository } from './members.repository';
import { MembersService } from './members.service';

export class MembersController {
  readonly router = Router();

  static inject = injectableClass(
    this,
    TOKENS.sessionProvider,
    TOKENS.membersService,
    TOKENS.membersRepository
  );

  constructor(
    private readonly sessionProvider: SessionProvider,
    private readonly membersService: MembersService,
    private readonly membersRepository: MembersRepository
  ) {
    this.router.use(this.authenticated);
    this.router.get('/', this.listMembers);
    this.router.get('/:memberId', this.getMember);
    this.router.put('/:memberId/profile', this.canUpdateMemberProfile, this.updateMemberProfile);
  }

  authenticated: RequestHandler = (req, res, next) => {
    this.sessionProvider.getMember();
    next();
  };

  listMembers: RequestHandler<never, shared.Member[]> = async (req, res) => {
    const schema = z.object({
      sort: z.nativeEnum(shared.MembersSort).optional(),
    });

    const { sort } = schema.parse(req.query);

    res.json(await this.membersRepository.query_listMembers(sort ?? shared.MembersSort.firstName));
  };

  getMember: RequestHandler<{ memberId: string }, shared.Member> = async (req, res) => {
    const member = await this.membersRepository.query_getMember(req.params.memberId);

    if (!member) {
      return res.status(404).end();
    }

    res.json(member);
  };

  canUpdateMemberProfile: RequestHandler<{ memberId: string }> = (req, res, next) => {
    const authenticatedMember = this.sessionProvider.getMember();
    const memberId = req.params.memberId;

    if (authenticatedMember.id !== memberId) {
      throw new AuthorizationError();
    }

    next();
  };

  updateMemberProfile: RequestHandler<{ memberId: string }> = async (req, res) => {
    const schema = z.object({
      firstName: z.string(),
      lastName: z.string(),
      emailVisible: z.boolean(),
      phoneNumbers: z.array(z.object({ number: z.string().regex(/^0\d{9}$/), visible: z.boolean() })),
      bio: z.string().optional(),
      address: z
        .object({
          line1: z.string(),
          line2: z.string().optional(),
          postalCode: z.string(),
          city: z.string(),
          country: z.string(),
          position: z.tuple([z.number(), z.number()]).optional(),
        })
        .optional(),
      onboardingCompleted: z.boolean().optional(),
    });

    await this.membersService.updateMemberProfile(req.params.memberId, schema.parse(req.body));

    res.status(204).end();
  };
}

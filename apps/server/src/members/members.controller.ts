import crypto from 'node:crypto';

import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';
import { z } from 'zod';

import { AuthorizationError } from '../authorization-error';
import { HttpStatus } from '../http-status';
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
    this.router.get('/:memberId/avatar', this.getMemberAvatar);
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
      return res.status(HttpStatus.notFound).end();
    }

    res.json(member);
  };

  getMemberAvatar: RequestHandler<{ memberId: string }, shared.Member> = async (req, res) => {
    const member = await this.membersRepository.getMember(req.params.memberId);

    if (!member) {
      return res.status(HttpStatus.notFound).end();
    }

    const email = member.email;
    const hash = crypto.createHash('sha256').update(email).digest('hex');

    const search = new URL(req.url, `http://${req.hostname}`).search;
    const url = `https://www.gravatar.com/avatar/${hash}${search}`;

    res.status(HttpStatus.permanentRedirect).header('Location', url).end();
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
      firstName: z.string().trim().max(256),
      lastName: z.string().trim().max(256),
      emailVisible: z.boolean(),
      phoneNumbers: z.array(z.object({ number: z.string().regex(/^0\d{9}$/), visible: z.boolean() })),
      bio: z.string().trim().max(4096).optional(),
      address: z
        .object({
          line1: z.string().trim().max(256),
          line2: z.string().trim().max(256).optional(),
          postalCode: z.string().trim().max(16),
          city: z.string().trim().max(256),
          country: z.string().trim().max(256),
          position: z.tuple([z.number(), z.number()]).optional(),
        })
        .optional(),
      onboardingCompleted: z.boolean().optional(),
    });

    const { memberId } = req.params;
    const data = schema.parse(req.body);

    await this.membersService.updateMemberProfile(memberId, data);

    res.status(HttpStatus.noContent).end();
  };
}

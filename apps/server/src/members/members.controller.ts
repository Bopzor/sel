import crypto from 'node:crypto';

import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';
import { z } from 'zod';

import { SessionProvider } from '../authentication/session.provider';
import { AuthorizationError } from '../authorization-error';
import { HttpStatus } from '../http-status';
import { CommandBus } from '../infrastructure/cqs/command-bus';
import { QueryBus } from '../infrastructure/cqs/query-bus';
import { MemberRepository } from '../persistence/repositories/member/member.repository';
import { COMMANDS, QUERIES, TOKENS } from '../tokens';

export class MembersController {
  readonly router = Router();

  static inject = injectableClass(
    this,
    TOKENS.queryBus,
    TOKENS.commandBus,
    TOKENS.sessionProvider,
    TOKENS.memberRepository,
  );

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly sessionProvider: SessionProvider,
    private readonly membersRepository: MemberRepository,
  ) {
    this.router.use(this.authenticated);
    this.router.get('/', this.listMembers);
    this.router.get('/:memberId', this.getMember);
    this.router.get('/:memberId/avatar', this.getMemberAvatar);
    this.router.put('/:memberId/profile', this.isAuthenticatedMember, this.updateMemberProfile);
    this.router.post('/:memberId/onboarding', this.isAuthenticatedMember, this.completeOnboarding);
  }

  authenticated: RequestHandler = (req, res, next) => {
    this.sessionProvider.getMember();
    next();
  };

  listMembers: RequestHandler<never, shared.Member[]> = async (req, res) => {
    const schema = z.object({
      sort: z.nativeEnum(shared.MembersSort).optional(),
    });

    const { sort = shared.MembersSort.firstName } = schema.parse(req.query);

    res.json(await this.queryBus.executeQuery(QUERIES.listMembers, { sort }));
  };

  getMember: RequestHandler<{ memberId: string }, shared.Member> = async (req, res) => {
    const memberId = req.params.memberId;
    const member = await this.queryBus.executeQuery(QUERIES.getMember, { memberId });

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

  isAuthenticatedMember: RequestHandler<{ memberId: string }> = (req, res, next) => {
    const authenticatedMember = this.sessionProvider.getMember();
    const memberId = req.params.memberId;

    if (authenticatedMember.id !== memberId) {
      throw new AuthorizationError();
    }

    next();
  };

  private static updateMemberProfileSchema = z.object({
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
  });

  updateMemberProfile: RequestHandler<{ memberId: string }> = async (req, res) => {
    const { memberId } = req.params;
    const data = MembersController.updateMemberProfileSchema.parse(req.body);

    await this.commandBus.executeCommand(COMMANDS.updateMemberProfile, {
      memberId,
      data,
    });

    res.status(HttpStatus.noContent).end();
  };

  private static completeOnboardingSchema = z.object({
    profile: MembersController.updateMemberProfileSchema,
    notificationDelivery: z.object({
      email: z.boolean(),
      push: z.boolean(),
    }),
  });

  completeOnboarding: RequestHandler<{ memberId: string }> = async (req, res) => {
    const { memberId } = req.params;
    const data = MembersController.completeOnboardingSchema.parse(req.body);

    await this.commandBus.executeCommand(COMMANDS.updateMemberProfile, {
      memberId,
      data: data.profile,
      onboardingCompleted: true,
    });

    await this.commandBus.executeCommand(COMMANDS.changeNotificationDeliveryType, {
      memberId,
      notificationDeliveryType: data.notificationDelivery,
    });

    res.status(HttpStatus.noContent).end();
  };
}

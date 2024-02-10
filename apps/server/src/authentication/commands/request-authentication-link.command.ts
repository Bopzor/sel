import { injectableClass } from 'ditox';

import { ConfigPort } from '../../infrastructure/config/config.port';
import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { GeneratorPort } from '../../infrastructure/generator/generator.port';
import { AuthenticationLinkRequested } from '../../members/member-events';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TokenRepository } from '../../persistence/repositories/token/token.repository';
import { TOKENS } from '../../tokens';
import { AuthenticationService } from '../authentication.service';
import { TokenType } from '../token.entity';

export type RequestAuthenticationLinkCommand = {
  email: string;
};

export class RequestAuthenticationLink implements CommandHandler<RequestAuthenticationLinkCommand> {
  static inject = injectableClass(
    this,
    TOKENS.config,
    TOKENS.generator,
    TOKENS.eventPublisher,
    TOKENS.memberRepository,
    TOKENS.tokenRepository,
    TOKENS.authenticationService,
  );

  constructor(
    private readonly config: ConfigPort,
    private readonly generator: GeneratorPort,
    private readonly eventPublisher: EventPublisherPort,
    private readonly memberRepository: MemberRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async handle({ email }: RequestAuthenticationLinkCommand): Promise<void> {
    const member = await this.memberRepository.getMemberFromEmail(email);

    if (!member) {
      return;
    }

    const previousToken = await this.tokenRepository.findByMemberId(member.id, TokenType.authentication);

    if (previousToken) {
      await this.tokenRepository.revoke(previousToken.id);
    }

    const token = await this.authenticationService.generateToken(
      TokenType.authentication,
      this.generator.id(),
      member.id,
    );

    const authenticationUrl = new URL(this.config.app.baseUrl);
    authenticationUrl.searchParams.set('auth-token', token.value);

    this.eventPublisher.publish(new AuthenticationLinkRequested(member.id, authenticationUrl.toString()));
  }
}

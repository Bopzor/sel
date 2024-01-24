import { injectableClass } from 'ditox';

import { ConfigPort } from '../../infrastructure/config/config.port';
import { EventsPort } from '../../infrastructure/events/events.port';
import { GeneratorPort } from '../../infrastructure/generator/generator.port';
import { AuthenticationLinkRequested } from '../../members/events';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TokenRepository } from '../../persistence/repositories/token/token.repository';
import { TOKENS } from '../../tokens';
import { AuthenticationService } from '../authentication.service';
import { TokenType } from '../token.entity';

export class RequestAuthenticationLink {
  static inject = injectableClass(
    this,
    TOKENS.config,
    TOKENS.generator,
    TOKENS.events,
    TOKENS.memberRepository,
    TOKENS.tokenRepository,
    TOKENS.authenticationService
  );

  constructor(
    private readonly config: ConfigPort,
    private readonly generator: GeneratorPort,
    private readonly events: EventsPort,
    private readonly memberRepository: MemberRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly authenticationService: AuthenticationService
  ) {}

  async handle(email: string): Promise<void> {
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
      member.id
    );

    const authenticationUrl = new URL(this.config.app.baseUrl);
    authenticationUrl.searchParams.set('auth-token', token.value);

    this.events.emit(new AuthenticationLinkRequested(member.id, authenticationUrl.toString()));
  }
}

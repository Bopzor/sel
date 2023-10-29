import { GeneratorPort } from './generator.port';

export class StubGenerator implements GeneratorPort {
  tokenValue = '';

  token(): string {
    return this.tokenValue;
  }
}

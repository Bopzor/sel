import { GeneratorPort } from './generator.port';

export class StubGenerator implements GeneratorPort {
  idValue = '';

  id(): string {
    return this.idValue;
  }

  tokenValue = '';

  token(): string {
    return this.tokenValue;
  }
}

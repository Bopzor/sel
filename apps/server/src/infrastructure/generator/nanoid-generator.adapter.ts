import { injectableClass } from 'ditox';
import { customAlphabet } from 'nanoid';

import { GeneratorPort } from './generator.port';

export class NanoIdGenerator implements GeneratorPort {
  static inject = injectableClass(this);

  private static alphabet = [
    '0123456789',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toLowerCase(),
  ].join('');

  private generateId = customAlphabet(NanoIdGenerator.alphabet, 16);

  id(): string {
    return this.generateId();
  }

  private generateToken = customAlphabet(NanoIdGenerator.alphabet, 24);

  token(): string {
    return this.generateToken();
  }
}

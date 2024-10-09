import { injectableClass } from 'ditox';
import { customAlphabet } from 'nanoid';

export interface Generator {
  id(): string;
  token(): string;
}

export class NanoIdGenerator implements Generator {
  static inject = injectableClass(this);

  private static alphabet = [
    //
    '0123456789',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'abcdefghijklmnopqrstuvwxyz',
  ].join('');

  id = customAlphabet(NanoIdGenerator.alphabet, 16);
  token = customAlphabet(NanoIdGenerator.alphabet, 24);
}

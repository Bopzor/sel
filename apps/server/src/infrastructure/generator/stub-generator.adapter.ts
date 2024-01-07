import { assert } from '@sel/utils';

import { GeneratorPort } from './generator.port';

export class StubGenerator implements GeneratorPort {
  nextIds = new Array<string>();

  set nextId(value: string) {
    this.nextIds.unshift(value);
  }

  id(): string {
    const id = this.nextIds.splice(0, 1)[0];
    assert(id !== undefined, 'No next id');

    return id;
  }

  nextTokens = new Array<string>();

  set nextToken(value: string) {
    this.nextTokens.unshift(value);
  }

  token(): string {
    const token = this.nextTokens.splice(0, 1)[0];
    assert(token !== undefined, 'No next token');

    return token;
  }
}

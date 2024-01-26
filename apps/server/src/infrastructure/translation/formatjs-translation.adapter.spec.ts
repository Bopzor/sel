import { beforeEach, describe, expect, it } from 'vitest';

import { FormatJsTranslationAdapter } from './formatjs-translation.adapter';

describe('[Unit] FormatJsTranslationAdapter', () => {
  let adapter: FormatJsTranslationAdapter;

  beforeEach(() => {
    adapter = new FormatJsTranslationAdapter();
  });

  it('formats a notification title that is below 65 characters', () => {
    const result = adapter.notificationTitle('requestCommentCreated.title', 'title', {
      title: 'Accorder un piano',
    });

    expect(result).toEqual('Nouveau commentaire sur la demande "Accorder un piano"');
  });

  it('formats a notification title that is exactly 65 characters', () => {
    const result = adapter.notificationTitle('requestCommentCreated.title', 'title', {
      title: 'Accorder un très vieux piano',
    });

    expect(result).toEqual('Nouveau commentaire sur la demande "Accorder un très vieux piano"');
  });

  it('formats a notification title that is above 65 characters', () => {
    const result = adapter.notificationTitle('requestCommentCreated.title', 'title', {
      title: 'Accorder un très vieux piano qui sonne faux',
    });

    expect(result).toEqual('Nouveau commentaire sur la demande "Accorder un très vieux pian…"');
  });
});

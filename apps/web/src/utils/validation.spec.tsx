import { renderHook } from '@solidjs/testing-library';
import { JSX } from 'solid-js';
import { describe, expect, it } from 'vitest';
import z from 'zod';

import { IntlProvider } from 'src/intl/intl-provider';

import { createErrorMap } from './validation';

describe('createErrorMap', () => {
  const wrapper = (props: { children: JSX.Element }) => <IntlProvider>{props.children}</IntlProvider>;

  it('required number', () => {
    const schema = z.number();

    renderHook(
      () => {
        const error = createErrorMap();

        expect(() => schema.parse(undefined, { error })).toThrow('Ce champ est requis');
        expect(() => schema.parse(NaN, { error })).toThrow('Ce champ est requis');
        expect(() => schema.parse(42, { error })).not.toThrow();
      },
      { wrapper },
    );
  });

  it('invalid email', () => {
    const schema = z.email();

    renderHook(
      () => {
        const error = createErrorMap();

        expect(() => schema.parse('', { error })).toThrow("Format d'adresse email invalide");
      },
      { wrapper },
    );
  });

  it('number bounds', () => {
    const schema = z.number().min(1).max(2);

    renderHook(
      () => {
        const error = createErrorMap();

        expect(() => schema.parse(0, { error })).toThrow('Ce champ est trop petit (min : 1)');
        expect(() => schema.parse(3, { error })).toThrow('Ce champ est trop grand (max : 2)');
      },
      { wrapper },
    );
  });

  it('string length', () => {
    const schema1 = z.string().min(1).max(3);
    const schema2 = z.string().min(2).max(3);

    renderHook(
      () => {
        const error = createErrorMap();

        expect(() => schema1.parse('', { error })).toThrow('Ce champ est requis');
        expect(() => schema1.parse('1', { error })).not.toThrow();
        expect(() => schema2.parse('', { error })).toThrow('Ce champ est trop court (min : 2 caractères)');
        expect(() => schema2.parse('1234', { error })).toThrow('Ce champ est trop long (max : 3 caractères)');
      },
      { wrapper },
    );
  });
});

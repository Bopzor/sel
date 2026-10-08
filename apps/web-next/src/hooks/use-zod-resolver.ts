import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import type { FieldValues } from 'react-hook-form';
import type z from 'zod';

export function useZodResolver<
  Input extends FieldValues,
  Context,
  Output,
  T extends z.ZodType<Output, Input> = z.ZodType<Output, Input>,
>(schema: T) {
  const errorMap = useZodErrorMap();

  return zodResolver<Input, Context, Output, T>(schema, {
    error: errorMap,
  });
}

export function useZodErrorMap(): z.core.$ZodErrorMap {
  const { t } = useLingui();

  return (error) => {
    if (error.code === 'too_small' && error.origin === 'string' && error.minimum === 1) {
      return t`This field is required`;
    }

    if (error.code === 'invalid_value') {
      return t`Select an option`;
    }

    if (error.code === 'invalid_type' && error.expected === 'number') {
      return t`This field should be a number`;
    }

    if (error.code === 'invalid_type' && error.expected === 'int') {
      return t`This field should be a whole number`;
    }

    if (error.code === 'invalid_type' && error.input === undefined) {
      return t`This field is required`;
    }

    if (error.code === 'too_small' && error.origin === 'number') {
      return t`This field should be at least ${error.minimum}`;
    }

    if (error.code === 'too_big' && error.origin === 'number') {
      return t`This field should be at most ${error.maximum}`;
    }

    if (error.code === 'too_small') {
      return t`This field should be at least ${error.minimum} characters`;
    }

    if (error.code === 'too_big') {
      return t`This field should be at most ${error.maximum} characters`;
    }

    return error.message;
  };
}

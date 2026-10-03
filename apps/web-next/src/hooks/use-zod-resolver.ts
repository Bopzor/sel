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

function useZodErrorMap(): z.core.$ZodErrorMap {
  const { t } = useLingui();

  return (error) => {
    if (error.code === 'too_small') {
      return t`This field should be at least ${error.minimum} characters`;
    }

    return error.message;
  };
}

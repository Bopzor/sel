import { FieldValues, FormErrors, PartialValues, ValidateForm } from '@modular-forms/solid';
import { JSX } from 'solid-js';
import z from 'zod';

import { createTranslate } from 'src/intl/translate';

export function zodForm<TFieldValues extends FieldValues>(
  schema: z.ZodType<FieldValues>,
  params: z.core.ParseContext<z.core.$ZodIssue> = { error: createErrorMap() },
): ValidateForm<TFieldValues> {
  return async (values: PartialValues<TFieldValues>) => {
    const result = await schema.safeParseAsync(values, params);
    const formErrors: Record<string, string> = {};

    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');

        if (!formErrors[path]) {
          formErrors[path] = issue.message;
        }
      }
    }

    return formErrors as FormErrors<TFieldValues>;
  };
}

const T = createTranslate('common.validation');

export function createErrorMap(
  getCustomMessage?: (error: z.core.$ZodRawIssue) => JSX.Element | void,
): z.ZodErrorMap {
  const t = T.useTranslate();

  return (error) => {
    return (getCustomMessage?.(error) ?? getMessage(error)) as string | undefined;
  };

  function getMessage(error: z.core.$ZodRawIssue) {
    if (error.code === 'invalid_type' && new Array<unknown>(undefined, NaN).includes(error.input)) {
      return t('required');
    }

    if (error.code === 'invalid_format' && error.format === 'email') {
      return t('invalidEmail');
    }

    if (error.code === 'too_small') {
      if (error.origin === 'number') {
        return t('tooSmall', { min: Number(error.minimum) });
      }

      if (error.minimum === 1) {
        return t('required');
      }

      return t('tooShort', { min: Number(error.minimum) });
    }

    if (error.code === 'too_big') {
      if (error.origin === 'number') {
        return t('tooBig', { max: Number(error.maximum) });
      }

      return t('tooLong', { max: Number(error.maximum) });
    }
  }
}

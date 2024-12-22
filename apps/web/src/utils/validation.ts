import { FieldValues, FormErrors, PartialValues, ValidateForm } from '@modular-forms/solid';
import { JSX } from 'solid-js';
import { ParseParams, ZodErrorMap, ZodIssueOptionalMessage, ZodType } from 'zod';

import { createTranslate } from 'src/intl/translate';

// copied from https://github.com/fabian-hiller/modular-forms/blob/b8dd18b8487c9d41e7fe4aa67aa2e736f1d1fd37/packages/solid/src/adapters/zodForm.ts
// to add support for zod's parse params
export function zodForm<TFieldValues extends FieldValues>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: ZodType<any, any, TFieldValues>,
  params?: Partial<ParseParams>,
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
  getCustomMessage?: (error: ZodIssueOptionalMessage) => JSX.Element | void,
): ZodErrorMap {
  const t = T.useTranslate();

  return (error, ctx) => {
    const message = (getCustomMessage?.(error) ?? getMessage(error)) as string | undefined;

    return {
      message: message ?? ctx.defaultError,
    };
  };

  function getMessage(error: ZodIssueOptionalMessage) {
    if (error.code === 'invalid_type' && ['undefined', 'nan'].includes(error.received)) {
      return t('required');
    }

    if (error.code === 'invalid_string' && error.validation === 'email') {
      return t('invalidEmail');
    }

    if (error.code === 'too_small') {
      if (error.type === 'number') {
        return t('tooSmall', { min: Number(error.minimum) });
      }

      if (error.minimum === 1) {
        return t('required');
      }

      return t('tooShort', { min: Number(error.minimum) });
    }

    if (error.code === 'too_big') {
      if (error.type === 'number') {
        return t('tooBig', { max: Number(error.maximum) });
      }

      return t('tooLong', { max: Number(error.maximum) });
    }
  }
}

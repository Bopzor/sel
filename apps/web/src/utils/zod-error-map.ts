import { z } from 'zod';

import { Translate } from '../intl/translate';

const T = Translate.prefix('common.validation');

export function createErrorMap(customErrorMap?: z.ZodErrorMap): z.ZodErrorMap {
  const t = T.useTranslation();

  return (error, ctx) => {
    switch (error.code) {
      case z.ZodIssueCode.invalid_type:
        if (error.received === 'null') {
          return { message: t('required') };
        }

        break;

      case z.ZodIssueCode.too_small:
        if (error.type === 'string') {
          return { message: t('minLength', { min: error.minimum as number }) as string };
        }

        return { message: t('min', { min: error.minimum as number }) as string };

      case z.ZodIssueCode.too_big:
        if (error.type === 'string') {
          return { message: t('maxLength', { max: error.maximum as number }) as string };
        }

        return { message: t('max', { max: error.maximum as number }) as string };
    }

    if (customErrorMap) {
      return customErrorMap(error, ctx);
    }

    return { message: ctx.defaultError };
  };
}

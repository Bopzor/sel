import { z } from 'zod';

import { Translate } from './translate';

export const zod = () => {
  const t = Translate.prefix('common.validation').useTranslation();

  const customErrorMap: z.ZodErrorMap = (error, ctx) => {
    switch (error.code) {
      case z.ZodIssueCode.too_small:
        return { message: t('minLength', { min: error.minimum as number }) as string };

      case z.ZodIssueCode.too_big:
        return { message: t('maxLength', { max: error.maximum as number }) as string };
    }

    return { message: ctx.defaultError };
  };

  z.setErrorMap(customErrorMap);

  return z;
};

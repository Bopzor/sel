import { useLingui } from '@lingui/react/macro';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import type z from 'zod';

import { ApiError, NetworkError } from 'src/app/api';

import { useZodErrorMap } from './use-zod-resolver';

export function useFormApiError<Values extends FieldValues, Transformed>(
  form: UseFormReturn<Values, unknown, Transformed>,
) {
  const { t } = useLingui();
  const errorMap = useZodErrorMap();

  const message = (issue: z.core.$ZodIssue) => {
    // The issues sent by the API don't carry the rejected value.
    const result = errorMap({ ...issue, input: undefined });

    if (!result) {
      return issue.message;
    }

    if (typeof result === 'string') {
      return result;
    }

    return result.message;
  };

  return (error: Error) => {
    if (NetworkError.is(error)) {
      return form.setError('root', {
        type: 'server',
        message: t`Unable to reach the server, check your internet access`,
      });
    }

    const isValidationError = ApiError.is(error) && error.status === 400;
    const issues = isValidationError ? (error.issues ?? []) : [];

    const fieldName = (issue: z.core.$ZodIssue) => issue.path.join('.') as Path<Values>;
    const isField = (issue: z.core.$ZodIssue) => form.getValues(fieldName(issue)) !== undefined;

    if (issues.length === 0 || !issues.every(isField)) {
      form.setError('root', { type: 'server', message: error.message });
    } else {
      issues.forEach((issue, index) => {
        form.setError(
          fieldName(issue),
          { type: 'server', message: message(issue) },
          { shouldFocus: index === 0 },
        );
      });
    }
  };
}

import React, { useId } from 'react';

import { useTranslate } from '../i18n.context';

type FormControlProps = {
  label: React.ReactNode;
  errorLabel: string;
  error?: { message?: string };
  children: JSX.Element;
};

export const FormControl = ({ label, errorLabel, error, children }: FormControlProps) => {
  const t = useTranslate('common');
  const errorMessageId = useId();

  return (
    <div className="col gap-0.5">
      <label className="font-medium">{label}</label>

      {React.cloneElement(children, {
        'aria-invalid': Boolean(error?.message),
        'aria-errormessage': errorMessageId,
      })}

      {error?.message && (
        <div id={errorMessageId} className="pl-1 font-medium text-red">
          {t(`formErrors.${error.message}`, { label: errorLabel })}
        </div>
      )}
    </div>
  );
};

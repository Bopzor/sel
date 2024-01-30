import { useIntl } from '@cookbook/solid-intl';
import { formatDateRelative } from '@sel/utils';

type FormattedDateProps = Intl.DateTimeFormatOptions & {
  date: string | Date | number | undefined;
};

export const FormattedDate = (props: FormattedDateProps) => {
  const intl = useIntl();

  return <>{intl.formatDate(props.date, props)}</>;
};

type FormattedRelativeDateProps = {
  date: string;
  addSuffix?: boolean;
};

export const FormattedRelativeDate = (props: FormattedRelativeDateProps) => {
  return <>{formatDateRelative(props.date, props.addSuffix)}</>;
};

import { useLingui } from '@lingui/react/macro';
import { Icon } from '@sel/ui';

export function DateIcon({ date }: { date?: Date }) {
  const { i18n } = useLingui();

  const day = date?.getDate();
  const month = date?.toLocaleDateString(i18n.locale, { month: 'short' }).replace('.', '');
  const year = date?.getFullYear();

  const sameYear = year === new Date().getFullYear();

  return (
    <div
      aria-hidden
      className="stack size-14 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary"
    >
      {date === undefined ? (
        <Icon name="event" />
      ) : (
        <>
          <span className="text-title-3 leading-none">{day}</span>
          <span className="text-caption uppercase">{month}</span>
          {!sameYear && <span className="text-[0.75rem] leading-none">{year}</span>}
        </>
      )}
    </div>
  );
}

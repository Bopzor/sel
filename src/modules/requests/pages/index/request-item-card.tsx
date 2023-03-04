import { useFormatDate } from '../../../../app/i18n.context';
import { gravatarUrl } from '../../../../utils/gravatar';
import { Request } from '../../aliases';

type RequestItemCardProps = {
  request: Request;
};

export const RequestItemCard = ({ request }: RequestItemCardProps) => {
  const formatDate = useFormatDate({ dateStyle: 'medium' });
  const formatDateFull = useFormatDate({ dateStyle: 'full', timeStyle: 'short' });

  return (
    <div className="card col gap-1 p-1">
      <div className="col flex gap-1 md:flex-row-reverse md:items-start md:justify-between">
        <div className="row items-center gap-1">
          <span className="font-medium">{request.requester.name}</span>
          <img alt="avatar" src={gravatarUrl(request.requester.email)} className="h-2 w-2 rounded-full" />
        </div>

        {/* eslint-disable-next-line tailwindcss/no-arbitrary-value */}
        <strong className="pt-[4px] text-muted">{request.title}</strong>
      </div>

      <p className="line-clamp-3">{request.description}</p>

      <div title={formatDateFull(request.creationDate)} className="self-start text-sm text-muted">
        {formatDate(request.creationDate)}
      </div>
    </div>
  );
};

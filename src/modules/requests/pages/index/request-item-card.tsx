import { useFormatDate } from '../../../../app/i18n.context';
import { MemberAvatarName } from '../../../members/components/member-avatar-name';
import { Request } from '../../aliases';

type RequestItemCardProps = {
  request: Request;
};

export const RequestItemCard = ({ request }: RequestItemCardProps) => {
  const formatDate = useFormatDate({ dateStyle: 'medium' });
  const formatDateFull = useFormatDate({ dateStyle: 'full', timeStyle: 'short' });
  const requester = request.requester;

  return (
    <div className="card col gap-1 p-1">
      <div className="col flex gap-1 md:flex-row-reverse md:items-start md:justify-between">
        <MemberAvatarName inline size="small" member={{ ...requester, fullName: requester.name }} />

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

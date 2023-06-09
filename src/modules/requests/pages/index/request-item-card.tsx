import { useFormatDate } from '../../../../app/i18n.context';
import { MemberAvatarName } from '../../../members/components/member-avatar-name';
import { Request } from '../../index';

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
        <MemberAvatarName inline size="small" member={requester} />

        {/* eslint-disable-next-line tailwindcss/no-arbitrary-value */}
        <strong className="pt-[4px] text-lg text-muted">{request.title}</strong>
      </div>

      <div
        // todo: sanitize input
        dangerouslySetInnerHTML={{ __html: request.description }}
        className="prose max-w-none line-clamp-4"
      />

      <div title={formatDateFull(request.creationDate)} className="self-start text-sm text-muted">
        {formatDate(request.creationDate)}
      </div>
    </div>
  );
};

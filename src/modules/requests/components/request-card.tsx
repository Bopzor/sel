import clsx from 'clsx';

import { Request } from '../aliases';

type RequestCardProps = {
  request: Request;
  clampDescription?: boolean;
};

export const RequestCard = ({ request, clampDescription }: RequestCardProps) => (
  <div className="card col gap-1 p-1">
    <div className="row items-center gap-1">
      <div className="h-2 w-2 rounded-full bg-inverted/20" />
      <span className="font-medium">Nils</span>
    </div>

    <strong className="text-muted">{request.title}</strong>

    <p className={clsx(clampDescription && 'line-clamp-3')}>{request.description}</p>
  </div>
);

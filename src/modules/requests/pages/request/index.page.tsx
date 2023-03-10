import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

import { BackLink } from '../../../../app/components/back-link';
import { FallbackSpinner } from '../../../../app/components/fallback';
import { Show } from '../../../../app/components/show';
import { FRONT_TOKENS } from '../../../../app/front-tokens';
import { useQuery } from '../../../../app/hooks/use-query';
import { Trans, Translation, useFormatDate, useTranslate } from '../../../../app/i18n.context';
import { useRouteParam } from '../../../../renderer/page-context';
import { MemberAvatarName } from '../../../members/components/member-avatar-name';
import { Request } from '../../index';

const T = Translation.create('requests');

export const Page = () => {
  const requestId = useRouteParam('requestId');
  const [request] = useQuery(FRONT_TOKENS.requestsService, 'getRequest', requestId);

  return (
    <>
      <BackLink href="/demandes" />

      <Show when={request} fallback={<FallbackSpinner />}>
        {(request) => <RequestComponent request={request} />}
      </Show>
    </>
  );
};

type RequestComponentProps = {
  request: Request;
};

const RequestComponent = ({ request }: RequestComponentProps) => (
  <div className="row gap-2">
    <div className="col flex-1 gap-2">
      <div className="card col gap-1 p-2">
        <strong className="text-muted">{request.title}</strong>
        <p>{request.description}</p>
      </div>

      <div className="col gap-2 md:hidden">
        <RequestInformation request={request} />
      </div>
    </div>

    {/* eslint-disable-next-line tailwindcss/no-arbitrary-value */}
    <div className="md:col hidden min-w-[22rem] gap-2">
      <RequestInformation request={request} />
    </div>
  </div>
);

type RequestInformationProps = {
  request: Request;
  className?: string;
};

export const RequestInformation = ({ request, className }: RequestInformationProps) => {
  const t = useTranslate('common');
  const formatDate = useFormatDate({ dateStyle: 'medium', timeStyle: 'short' });

  const requester = request.requester;

  return (
    <aside className={clsx('card col gap-1 p-1 pt-2', className)}>
      <MemberAvatarName member={requester} />

      <div className="col gap-1 text-muted">
        <div className="text-sm leading-6">
          <a
            href={`tel:${requester.phoneNumber}`}
            className="row items-center gap-0.5 font-semibold hover:underline"
          >
            <PhoneIcon className="h-1 w-1" /> {requester.phoneNumber}
          </a>
          <a
            href="mailto:myself@domain.tld"
            className="row items-center gap-0.5 font-semibold hover:underline"
          >
            <EnvelopeIcon className="h-1 w-1" /> {requester.email}
          </a>
        </div>

        <hr />

        <div className="col gap-0.5 font-semibold">
          <a href={`/demandes/${request.id}/éditer`}>
            <T>Edit</T>
          </a>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a href="#" onClick={() => alert(t('This feature is not available yet'))} className="text-green">
            <T>Convert into exchange</T>
          </a>
        </div>

        <hr />

        <div className="text-xs leading-5">
          <div>
            <Trans
              ns="requests"
              i18nKey="Requested at"
              values={{ date: formatDate(request.creationDate) }}
              components={{ strong: <strong /> }}
            />
          </div>
          <div>
            <Trans
              ns="requests"
              i18nKey="Last updated at"
              values={{ date: formatDate(request.lastEditionDate) }}
              components={{ strong: <strong /> }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

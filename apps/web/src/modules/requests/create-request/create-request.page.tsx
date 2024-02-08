import { useNavigate } from '@solidjs/router';

import { BackLink } from '../../../components/back-link';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { routes } from '../../../routes';
import { TOKENS } from '../../../tokens';
import { notify } from '../../../utils/notify';
import { RequestForm } from '../components/request-form';

const T = Translate.prefix('requests.create');

export default function CreateRequestPage() {
  const t = T.useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <BackLink href={routes.requests.list} />

      <h1>
        <T id="title" />
      </h1>

      <CreateRequestForm
        onCreated={(requestId) => {
          navigate(routes.requests.request(requestId));
          notify.success(t('created'));
        }}
      />
    </>
  );
}

function CreateRequestForm(props: { onCreated: (requestId: string) => void }) {
  const requestApi = container.resolve(TOKENS.requestApi);

  return (
    <RequestForm
      submit={<T id="submit" />}
      onSubmit={(title, body) => requestApi.createRequest(title, body)}
      onSubmitted={(requestId) => props.onCreated(requestId as string)}
    />
  );
}

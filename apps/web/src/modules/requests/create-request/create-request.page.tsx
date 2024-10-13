import { useNavigate } from '@solidjs/router';

import { Breadcrumb, breadcrumb } from '../../../components/breadcrumb';
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
      <Breadcrumb items={[breadcrumb.requests(), breadcrumb.createRequest()]} />

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
  const api = container.resolve(TOKENS.api);

  return (
    <RequestForm
      submit={<T id="submit" />}
      onSubmit={(title, body) => api.createRequest({ body: { title, body } })}
      onSubmitted={(requestId) => props.onCreated(requestId as string)}
    />
  );
}

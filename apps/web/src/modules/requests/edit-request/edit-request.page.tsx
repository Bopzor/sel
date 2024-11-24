import { Request } from '@sel/shared';
import { useNavigate, useParams } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { Show } from 'solid-js';

import { Breadcrumb, breadcrumb } from '../../../components/breadcrumb';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { routes } from '../../../routes';
import { TOKENS } from '../../../tokens';
import { notify } from '../../../utils/notify';
import { RequestForm } from '../components/request-form';

const T = Translate.prefix('requests.edit');

export default function EditRequestPage() {
  const api = container.resolve(TOKENS.api);
  const params = useParams<{ requestId: string }>();
  const t = T.useTranslation();
  const navigate = useNavigate();

  const query = createQuery(() => ({
    queryKey: ['getRequest', params.requestId],
    queryFn: () => api.getRequest({ path: { requestId: params.requestId } }),
  }));

  return (
    <Show when={query.data}>
      {(request) => (
        <>
          <Breadcrumb
            items={[breadcrumb.requests(), breadcrumb.request(request()), breadcrumb.editRequest(request())]}
          />

          <h1 class="truncate">
            <T id="title" values={{ requestTitle: request().title }} />
          </h1>

          <EditRequestForm
            request={request()}
            onEdited={() => {
              navigate(routes.requests.request(request().id));
              notify.success(t('edited'));
            }}
          />
        </>
      )}
    </Show>
  );
}

function EditRequestForm(props: { request: Request; onEdited: () => void }) {
  const api = container.resolve(TOKENS.api);

  return (
    <RequestForm
      request={props.request}
      submit={<Translate id="common.save" />}
      onSubmit={(title, body) =>
        api.editRequest({ path: { requestId: props.request.id }, body: { title, body } })
      }
      onSubmitted={props.onEdited}
    />
  );
}

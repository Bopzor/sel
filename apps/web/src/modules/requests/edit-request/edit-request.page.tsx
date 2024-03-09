import { Request } from '@sel/shared';
import { useNavigate, useParams } from '@solidjs/router';
import { Show, createResource } from 'solid-js';

import { Breadcrumb, breadcrumb } from '../../../components/breadcrumb';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { routes } from '../../../routes';
import { TOKENS } from '../../../tokens';
import { notify } from '../../../utils/notify';
import { RequestForm } from '../components/request-form';

const T = Translate.prefix('requests.edit');

export default function EditRequestPage() {
  const requestApi = container.resolve(TOKENS.requestApi);
  const { requestId } = useParams<{ requestId: string }>();
  const t = T.useTranslation();
  const navigate = useNavigate();

  const [request] = createResource(requestId, async (requestId) => {
    return requestApi.getRequest(requestId);
  });

  return (
    <>
      <Breadcrumb
        items={[
          breadcrumb.requests(),
          request.latest && breadcrumb.request(request.latest),
          request.latest && breadcrumb.editRequest(request.latest),
        ]}
      />

      <Show when={request()}>
        {(request) => (
          <>
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
    </>
  );
}

function EditRequestForm(props: { request: Request; onEdited: () => void }) {
  const requestApi = container.resolve(TOKENS.requestApi);

  return (
    <RequestForm
      request={props.request}
      submit={<Translate id="common.save" />}
      onSubmit={(title, body) => requestApi.editRequest(props.request.id, title, body)}
      onSubmitted={props.onEdited}
    />
  );
}

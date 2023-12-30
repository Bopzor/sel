import { createForm } from '@felte/solid';
import { Request } from '@sel/shared';
import { useParams } from '@solidjs/router';
import clsx from 'clsx';
import { Show, onMount } from 'solid-js';

import { BackLink } from '../components/back-link';
import { Button } from '../components/button';
import { FormField } from '../components/form-field';
import { Input } from '../components/input';
import { RichEditor, RichEditorToolbar, createRichEditor } from '../components/rich-editor';
import { Translate } from '../intl/translate';
import { routes } from '../routes';
import { getAppActions, getAppState } from '../store/app-store';

const T = Translate.prefix('requests.edit');

export function EditRequestPage() {
  const { requestId } = useParams<{ requestId: string }>();

  const state = getAppState();
  const { loadRequest } = getAppActions();

  onMount(() => loadRequest(requestId));

  return (
    <>
      <BackLink href={routes.requests.request(requestId)} />

      <h1 class="truncate">
        <T id="title" values={{ requestTitle: state.request?.title }} />
      </h1>

      <Show when={state.request}>{(request) => <EditRequestForm request={request()} />}</Show>
    </>
  );
}

type EditRequestFormProps = {
  request: Request;
};

export function EditRequestForm(props: EditRequestFormProps) {
  const t = T.useTranslation();

  const { editRequest } = getAppActions();

  let ref!: HTMLDivElement;

  const editor = createRichEditor(() => ref, {
    placeholder: t('bodyPlaceholder'),
    initialValue: props.request.body,
    onChange(html) {
      setData('body', html);
    },
  });

  const { form, setData, isSubmitting } = createForm({
    initialValues: {
      title: props.request.title,
      body: props.request.body,
    },
    async onSubmit(values) {
      await editRequest(values.title, values.body);
    },
  });

  return (
    <form use:form class="col my-6 max-w-4xl gap-4">
      <FormField label={t('titleLabel')}>
        <Input name="title" placeholder={t('titlePlaceholder')} />
      </FormField>

      <FormField label={t('bodyLabel')}>
        <div
          class={clsx(
            'rounded-lg border-2',
            'transition-colors focus-within:border-primary/50',
            'border-transparent bg-neutral shadow'
          )}
        >
          <RichEditor ref={ref} class="min-h-[16rem] [&>:first-of-type]:px-4 [&>:first-of-type]:py-3">
            <RichEditorToolbar editor={editor()} class="p-1" />
          </RichEditor>
        </div>
      </FormField>

      <Button type="submit" class="self-start" loading={isSubmitting()}>
        <Translate id="common.save" />
      </Button>
    </form>
  );
}

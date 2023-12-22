import { createForm } from '@felte/solid';
import clsx from 'clsx';

import { BackLink } from '../../components/back-link';
import { Button } from '../../components/button';
import { FormField } from '../../components/form-field';
import { Input } from '../../components/input';
import { RichEditor, RichEditorToolbar, createRichEditor } from '../../components/rich-editor';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';
import { getMutations } from '../../store/app-store';

const T = Translate.prefix('requests.create');

export function CreateRequestPage() {
  const t = T.useTranslation();

  const { createRequest } = getMutations();

  let ref!: HTMLDivElement;

  const editor = createRichEditor(() => ref, {
    placeholder: t('bodyPlaceholder'),
    onChange(html) {
      setData('body', html);
    },
  });

  const { form, setData } = createForm({
    initialValues: {
      title: '',
      body: '',
    },
    async onSubmit(values) {
      await createRequest(values.title, values.body);
    },
  });

  return (
    <>
      <BackLink href={routes.requests.list} />

      <h1>
        <T id="title" />
      </h1>

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

        <Button type="submit" class="self-start">
          <T id="submit" />
        </Button>
      </form>
    </>
  );
}

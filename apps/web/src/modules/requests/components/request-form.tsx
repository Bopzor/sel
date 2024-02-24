import { createForm } from '@felte/solid';
import { Request } from '@sel/shared';
import clsx from 'clsx';
import { JSX } from 'solid-js';

import { Button } from '../../../components/button';
import { FormField } from '../../../components/form-field';
import { Input } from '../../../components/input';
import { createRichEditor, RichEditorToolbar } from '../../../components/rich-editor';
import { Translate } from '../../../intl/translate';
import { createErrorHandler } from '../../../utils/create-error-handler';

const T = Translate.prefix('requests.form');

type RequestFormProps = {
  request?: Request;
  submit: JSX.Element;
  onSubmit: (title: string, body: string) => Promise<unknown>;
  onSubmitted: (result: unknown) => void;
};

export function RequestForm(props: RequestFormProps) {
  const t = T.useTranslation();

  const { form, setData, isSubmitting } = createForm({
    initialValues: {
      title: props.request?.title ?? '',
      body: props.request?.body ?? '',
    },
    async onSubmit(values) {
      return props.onSubmit(values.title, values.body);
    },
    onSuccess(result) {
      props.onSubmitted(result);
    },
    onError: createErrorHandler(),
  });

  return (
    <form use:form class="col my-6 max-w-4xl gap-4">
      <FormField label={<T id="titleLabel" />}>
        <Input name="title" placeholder={t('titlePlaceholder')} />
      </FormField>

      <FormField label={<T id="bodyLabel" />}>
        <RichEditor
          placeholder={t('bodyPlaceholder')}
          initialValue={props.request?.body}
          onChange={(html) => setData('body', html)}
        />
      </FormField>

      <Button type="submit" class="self-start" loading={isSubmitting()}>
        {props.submit}
      </Button>
    </form>
  );
}

type RichEditorProps = {
  placeholder?: string;
  initialValue?: string;
  onChange?: (html: string) => void;
};

function RichEditor(props: RichEditorProps) {
  let ref!: HTMLDivElement;

  const editor = createRichEditor(() => ref, {
    placeholder: props.placeholder,
    initialValue: props.initialValue,
    onChange: props.onChange,
  });

  return (
    <div
      class={clsx(
        'col min-h-64 resize-y overflow-auto',
        'rounded-lg border-2',
        'border-transparent bg-neutral shadow',
        'transition-colors focus-within:border-primary/50',
      )}
    >
      <div ref={ref} class="col grow overflow-y-auto px-4 py-3" />

      <div class="row items-end justify-between p-1">
        <RichEditorToolbar editor={editor()} />
      </div>
    </div>
  );
}

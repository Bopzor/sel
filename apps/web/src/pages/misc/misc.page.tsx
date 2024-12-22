import { getAppConfig } from 'src/application/config';
import { Card } from 'src/components/card';
import { externalLink } from 'src/components/link';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.misc');

export function MiscPage() {
  const { contactLink } = getAppConfig();

  return (
    <div class="col max-w-4xl gap-8">
      <h1>
        <T id="title" />
      </h1>

      <Card title={<T id="context.title" />}>
        <p class="whitespace-pre-line">
          <T id="context.description" />
        </p>
      </Card>

      <Card title={<T id="contact.title" />}>
        <p class="whitespace-pre-line">
          <T id="contact.description" values={{ link: externalLink(contactLink, { class: 'text-link' }) }} />
        </p>
      </Card>
    </div>
  );
}

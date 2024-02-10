import { Email } from '../common/email';
import { Section } from '../common/section';
import { Translate, translate } from '../intl/intl';

const fr = {
  greeting: 'Bonjour {firstName},',
  newVersion: "Une nouvelle version de l'app est disponible.",
};

type NewAppVersionEmailProps = {
  appBaseUrl: string;
  firstName: string;
  version: string;
};

export function subject() {
  return "Nouvelle version de l'app";
}

export function html(props: NewAppVersionEmailProps) {
  const messages = fr;

  return (
    <Email appBaseUrl={props.appBaseUrl} preview={subject()}>
      <Section>
        <mj-text padding="8px 0">
          <Translate message={messages.greeting} values={{ firstName: props.firstName }} />
        </mj-text>

        <mj-text padding="8px 0">
          <Translate message={messages.newVersion} />
        </mj-text>
      </Section>
    </Email>
  );
}

export function text(props: NewAppVersionEmailProps) {
  const messages = fr;

  return [translate(messages.greeting, { firstName: props.firstName }), translate(messages.newVersion)].join(
    '\n\n',
  );
}

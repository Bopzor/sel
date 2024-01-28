import { Email } from '../common/email';
import { Section } from '../common/section';

type TestEmailProps = {
  appBaseUrl: string;
  variable: string;
};

export function subject() {
  return 'Test email';
}

export function html(props: TestEmailProps) {
  return (
    <Email appBaseUrl={props.appBaseUrl} preview={subject()}>
      <Section>
        <mj-text font-size="20px" color="#F45E43" font-family="helvetica">
          This is a test email.
        </mj-text>

        <mj-text font-size="20px" color="#F45E43" font-family="helvetica">
          Variable: {props.variable}
        </mj-text>
      </Section>
    </Email>
  );
}

export function text(props: TestEmailProps) {
  return `
This is a test email.

Variable: ${props.variable}
  `;
}

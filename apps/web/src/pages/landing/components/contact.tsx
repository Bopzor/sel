import { JSX } from 'solid-js';

import { getAppConfig } from 'src/application/config';
import { ExternalLink } from 'src/components/link';
import { formatPhoneNumber } from 'src/intl/formatted';

export function ContactPhone(props: { icon?: JSX.Element; class?: string }) {
  const { contactPhone } = getAppConfig();

  return (
    <ExternalLink href={`tel:${contactPhone}`} class={props.class}>
      {props.icon}
      {formatPhoneNumber(contactPhone.replace(/^\+33/, '0'))}
    </ExternalLink>
  );
}

export function ContactEmail(props: { icon?: JSX.Element; class?: string }) {
  const { contactEmail } = getAppConfig();

  return (
    <ExternalLink href={`mailto:${contactEmail}`} class={props.class}>
      {props.icon}
      {contactEmail}
    </ExternalLink>
  );
}

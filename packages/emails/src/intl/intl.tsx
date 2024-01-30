import { JSX } from 'solid-js';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

type Values = Record<string, JSX.Element | ((children: JSX.Element) => JSX.Element)>;

type TranslateProps = {
  message: string;
  values?: Values;
};

const commonValues: Values = {
  strong: (children) => <span class="strong">{children}</span>,
};

export function Translate(props: TranslateProps) {
  return translate(props.message, props.values);
}

export function translate(message: string, values: Values = {}) {
  let match: RegExpMatchArray | null;

  values = { ...commonValues, ...values };

  while ((match = /\{([a-zA-Z0-9]+)\}/.exec(message)) !== null) {
    const key = match[1];
    const value = values[key];

    assert(typeof value === 'string', `Expected "${key}" to be a string\nMessage: ${message}`);

    message = message.replaceAll(match[0], value);
  }

  const elements: JSX.Element[] = [];

  while ((match = /<([a-zA-Z0-9]+)>([^<]*)<\/\1>/.exec(message)) !== null) {
    const index = match.index as number;
    const key = match[1];
    const children = match[2];
    const fn = values[key];

    assert(typeof fn === 'function', `Expected "${key}" to be a function\nMessage: ${message}`);

    elements.push(message.substring(0, index));
    elements.push(fn(children));

    message = message.substring(index + match[0].length);
  }

  if (elements.length === 0) {
    return message;
  }

  elements.push(message);

  return elements.filter((str) => str !== '');
}

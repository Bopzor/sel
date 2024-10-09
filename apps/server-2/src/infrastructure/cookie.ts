import { TOKENS } from 'src/tokens';

import { container } from './container';

export function setCookie(name: string, value: string, expires: Date) {
  const config = container.resolve(TOKENS.config);

  const setCookie = [
    `${name}=${value}`,
    `Expires=${expires.toUTCString()}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
  ];

  if (config.session.secure) {
    setCookie.push('Secure');
  }

  return setCookie.join('; ');
}

export function unsetCookie(name: string) {
  const setCookie = [`${name}=`, `Max-Age=0`, 'HttpOnly', 'Path=/', 'SameSite=Lax'];

  return setCookie.join('; ');
}

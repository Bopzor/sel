import { createAuthenticatedMember, createMember } from '@sel/shared/factories';

export const me = createAuthenticatedMember({
  id: 'me',
  number: 1,
  firstName: 'Jason',
  lastName: 'Talon',
});

export const claire = createMember({
  id: 'claire',
  number: 12,
  firstName: 'Claire',
  lastName: 'Dubois',
});

export const julien = createMember({
  id: 'julien',
  number: 13,
  firstName: 'Julien',
  lastName: 'Petit',
});

import { createUniqueId } from 'solid-js';

export function createId(givenId: () => string | undefined) {
  const generatedId = createUniqueId();

  return () => givenId() ?? generatedId;
}

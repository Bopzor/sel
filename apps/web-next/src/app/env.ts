declare global {
  /** Set by env.js, generated when the docker container starts. */
  var __ENV__: Partial<Record<keyof ImportMetaEnv, string>>;
}

export function getEnv(name: keyof ImportMetaEnv & `VITE_${string}`) {
  // runtime environment variables are '' when unset
  // oxlint-disable-next-line typescript/prefer-nullish-coalescing
  return globalThis.__ENV__[name] || import.meta.env[name];
}

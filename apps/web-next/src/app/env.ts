declare global {
  /** Set by env.js, generated when the docker container starts. */
  var __ENV__: Partial<Record<keyof ImportMetaEnv, string>>;
}

export function getEnv(name: keyof ImportMetaEnv & `VITE_${string}`) {
  return globalThis.__ENV__[name] ?? import.meta.env[name];
}

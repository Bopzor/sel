type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let installPrompt: BeforeInstallPromptEvent | undefined;

// Not available in Firefox and Safari.
export function watchInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event as BeforeInstallPromptEvent;
  });
}

export function canPromptInstall() {
  return installPrompt !== undefined;
}

export async function promptInstall() {
  const prompt = installPrompt;
  installPrompt = undefined;

  const result = await prompt?.prompt();

  return result?.outcome === 'accepted';
}

export function isIPhone() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isPwaInstalled() {
  return matchMedia('(display-mode: standalone)').matches;
}

declare global {
  interface Navigator {
    // Not available in Firefox and Safari.
    userAgentData?: { mobile: boolean };
  }
}

export function isMobile() {
  return navigator.userAgentData?.mobile ?? /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

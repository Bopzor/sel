export function detectDevice(): 'mobile' | 'desktop' {
  return isMobile() ? 'mobile' : 'desktop';
}

declare global {
  interface Navigator {
    // experimental API
    userAgentData?: { mobile: boolean };
  }
}

export function isMobile(): boolean {
  if (navigator.userAgentData) {
    return navigator.userAgentData.mobile;
  }

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

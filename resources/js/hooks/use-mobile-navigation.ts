import { useCallback } from 'react';

export const useMobileNavigation = () => {
  const cleanup = useCallback(() => {
    // Remove pointer-events style from body...
    document.body.style.removeProperty('pointer-events');
  }, []);

  return cleanup;
};

import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

interface UseSearchOptions {
  delay?: number;
  preserveState?: boolean;
  preserveScroll?: boolean;
  prefetch?: boolean;
}

export function useDebouncedSearch(options: UseSearchOptions = {}) {
  const { delay = 500, preserveState = true, preserveScroll = true, prefetch } = options;
  const [search, setSearch] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);

      const timeoutId = setTimeout(() => {
        router.get(
          '/documents',
          { search: value },
          {
            preserveState,
            preserveScroll,
            prefetch,
            onStart: () => setIsProcessing(true),
            onFinish: () => setIsProcessing(false),
            showProgress: false,
          }
        );
      }, delay);

      return () => clearTimeout(timeoutId);
    },
    [delay, preserveScroll, preserveState, prefetch]
  );

  return {
    search,
    handleSearch,
    isProcessing,
  };
}

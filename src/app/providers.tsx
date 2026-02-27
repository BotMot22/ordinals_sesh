'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { WalletProvider } from '@/contexts/WalletContext';
import { NostrProvider } from '@/contexts/NostrContext';
import { ToastProvider } from '@/components/common/Toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 2,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <NostrProvider>
          <ToastProvider>{children}</ToastProvider>
        </NostrProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

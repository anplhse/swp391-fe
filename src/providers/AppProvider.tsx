import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data được coi là fresh trong 5 phút
      gcTime: 1000 * 60 * 10, // 10 minutes - cache được giữ trong 10 phút (trước đây là cacheTime)
      retry: 1, // Retry 1 lần khi fail
      refetchOnWindowFocus: false, // Không refetch khi focus lại window
    },
  },
});

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

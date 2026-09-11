import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './routes/AppRouter.js';
import { useAuthStore } from './stores/authStore.js';
import { authApi } from './api/auth.api.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
      retry: (failureCount, error: any) => {
        // Do not retry 401 or 403 errors
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

export const App: React.FC = () => {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  // Attempt silent session recovery on initial load via HttpOnly cookie
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authApi.refresh();
        const { user, accessToken } = response.data;
        setAuth(user, accessToken);
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setAuth, clearAuth, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

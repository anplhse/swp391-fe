import { authService, AuthState, User } from '@/lib/auth';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  const login = async (userName: string, password: string) => {
    return await authService.login({ userName, password });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshToken = async () => {
    return await authService.refreshAccessToken();
  };

  return {
    ...authState,
    login,
    logout,
    refreshToken,
  };
}

export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}

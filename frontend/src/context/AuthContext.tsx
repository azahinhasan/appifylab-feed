import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<User>;
  register: (credentials: any) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // Rehydrate auth state from cookie on app load using useQuery
  const { data: user = null, isLoading } = useQuery<User | null>({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await apiClient.get<User>('/users/me');
      } catch (err) {
        return null;
      }
    },
    staleTime: Infinity, // keep session active without constant background refetching
    retry: false, // Don't retry if the user has no session (saves network requests and avoids console noise)
  });

  useEffect(() => {
    // Register 401 handler
    apiClient.onUnauthorized(() => {
      queryClient.setQueryData(['me'], null);
      const publicPaths = ['/login', '/register'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    });
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: (credentials: any) =>
      apiClient.post<{ user: User; token: string }>('/auth/login', credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: any) => {
      await apiClient.post<User>('/auth/register', credentials);
      // Auto login after successful registration
      return loginMutation.mutateAsync({
        email: credentials.email,
        password: credentials.password,
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
      queryClient.clear(); // Clear all query caches on logout
      window.location.href = '/login';
    },
  });

  const login = async (credentials: any): Promise<User> => {
    const result = await loginMutation.mutateAsync(credentials);
    return result.user;
  };

  const register = async (credentials: any): Promise<User> => {
    const result = await registerMutation.mutateAsync(credentials);
    return result.user;
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

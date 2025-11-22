import { apiClient } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export interface RoleEnum {
  name: string;
  enumValue: string[];
  description: string;
  type: string;
}

/**
 * Hook to fetch roles from API
 */
export function useRoles() {
  const { data, isLoading, error } = useQuery<RoleEnum>({
    queryKey: ['roles'],
    queryFn: () => apiClient.getUserProfileRoles(),
  });

  return {
    roles: data?.enumValue || [],
    roleEnum: data,
    isLoading,
    error,
  };
}


import { apiClient } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export interface VehicleModelEnum {
  name: string;
  enumValue: string[];
  description: string;
  type: string;
}

/**
 * Hook to fetch vehicle models enum from API
 */
export function useVehicleModels() {
  const { data, isLoading, error } = useQuery<VehicleModelEnum>({
    queryKey: ['vehicleModels'],
    queryFn: () => apiClient.getVehicleModelEnum(),
  });

  return {
    vehicleModels: data?.enumValue || [],
    vehicleModelEnum: data,
    isLoading,
    error,
  };
}


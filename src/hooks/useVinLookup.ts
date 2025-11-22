import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { useCallback, useEffect, useState } from 'react';

export interface VinData {
  vin: string;
  name: string;
  plateNumber: string;
  color: string;
  distanceTraveledKm: number;
  batteryDegradation: number;
  purchasedAt: string;
  createdAt: string;
  entityStatus: string;
  userId: number;
  username: string;
  modelId: number;
  modelName: string;
}

export function useVinLookup() {
  const { toast } = useToast();
  const [vinData, setVinData] = useState<VinData | null>(() => {
    try {
      const savedVinData = localStorage.getItem('bookingVinData');
      return savedVinData ? JSON.parse(savedVinData) : null;
    } catch {
      localStorage.removeItem('bookingVinData');
      return null;
    }
  });

  const lookupVin = useCallback(async (vin: string) => {
    if (!vin.trim()) return;

    try {
      const vehicleData = await apiClient.getVehicleByVin(vin);
      setVinData(vehicleData);
      toast({
        title: 'Thành công',
        description: 'Đã tìm thấy thông tin xe'
      });
      return vehicleData;
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tra cứu thông tin xe với mã VIN này. VIN có thể chưa được đăng ký trong hệ thống.',
        variant: 'destructive'
      });
      throw error;
    }
  }, [toast]);

  const clearVinData = useCallback(() => {
    setVinData(null);
    localStorage.removeItem('bookingVinData');
  }, []);

  // Save vinData to localStorage whenever it changes
  useEffect(() => {
    if (vinData) {
      localStorage.setItem('bookingVinData', JSON.stringify(vinData));
    } else {
      localStorage.removeItem('bookingVinData');
    }
  }, [vinData]);

  return {
    vinData,
    setVinData,
    lookupVin,
    clearVinData,
  };
}


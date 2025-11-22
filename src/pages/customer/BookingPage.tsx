import { BookingForm } from '@/components/BookingForm';
import { apiClient } from '@/lib/api';
import { useEffect, useState } from 'react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  compatibleVehicles: string[];
  relatedParts: Record<string, string[]>; // Model -> Parts mapping
  category?: string;
  status?: string;
}

export default function BookingPage() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const catalogs = await apiClient.getMaintenanceCatalogs();

        const mapped: Service[] = catalogs.map((catalog) => {
          const compatibleVehicles = catalog.models.map(m => m.modelName);

          const prices = catalog.models.map(m => m.maintenancePrice);
          const durations = catalog.models.map(m => m.estTimeMinutes);
          const price = prices.length ? Math.min(...prices) : 0;
          const duration = durations.length ? Math.min(...durations) : 0;

          const relatedParts: Record<string, string[]> = {};
          catalog.models.forEach(model => {
            relatedParts[model.modelName] = (model.parts || []).map(p => p.partName);
          });

          return {
            id: String(catalog.id),
            name: catalog.name,
            description: catalog.description,
            price,
            duration,
            compatibleVehicles,
            relatedParts,
            category: catalog.maintenanceServiceCategory,
            status: catalog.status,
          };
        });

        setServices(mapped);
      } catch (error) {
        console.error('Failed to load services:', error);
        setServices([]);
      }
    };

    loadServices();
  }, []);

  return (
    <div className="space-y-8">
      <BookingForm services={services} />
    </div>
  );
}
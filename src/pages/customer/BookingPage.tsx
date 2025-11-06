import { BookingForm } from '@/components/BookingForm';
import { useEffect, useState } from 'react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  compatibleVehicles: string[];
  relatedParts: Record<string, string[]>; // Model -> Parts mapping
  category: string;
}

export default function BookingPage() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    // Services should be loaded from API
    // TODO: Load services from API
    setServices([]);
  }, []);

  return <BookingForm services={services} />;
}
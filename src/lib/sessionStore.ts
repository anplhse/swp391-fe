export type RegisteredVehicle = {
  id: string;
  name: string;
  type: string;
  vin: string;
  plate?: string;
  year?: string;
};

const store: { vehicles: RegisteredVehicle[] } = {
  vehicles: [
    {
      id: '1',
      name: 'VinFast VF8',
      type: 'SUV',
      vin: 'RL4A1234567890ABCD',
      plate: '30A-12345',
      year: '2024'
    },
    {
      id: '2',
      name: 'VinFast VF9',
      type: 'SUV',
      vin: 'RL4B9876543210EFGH',
      plate: '30A-67890',
      year: '2024'
    },
    {
      id: '3',
      name: 'VinFast VFE34',
      type: 'Sedan',
      vin: 'RL4C5555555555IJKL',
      plate: '30A-11111',
      year: '2023'
    },
    {
      id: '4',
      name: 'VinFast VF5',
      type: 'Hatchback',
      vin: 'RL4D1111111111MNOP',
      plate: '30A-22222',
      year: '2024'
    }
  ],
};

export function getRegisteredVehicles(): RegisteredVehicle[] {
  return store.vehicles;
}

export function setRegisteredVehicles(vehicles: RegisteredVehicle[]): void {
  store.vehicles = vehicles;
}

export function addRegisteredVehicle(vehicle: RegisteredVehicle): void {
  store.vehicles = [...store.vehicles, vehicle];
}



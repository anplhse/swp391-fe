export type RegisteredVehicle = {
  id: string;
  name: string;
  type: string;
  vin: string;
  plate?: string;
  year?: string;
};

const store: { vehicles: RegisteredVehicle[] } = {
  vehicles: [], // Empty - data should come from API
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



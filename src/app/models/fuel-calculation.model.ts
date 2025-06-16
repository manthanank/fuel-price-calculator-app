export interface FuelCalculation {
  id: string;
  vehicleType: string;
  fuelType: string;
  mileage: number;
  distance: number;
  fuelPrice: number;
  totalFuel: number;
  totalCost: number;
  calculatedAt: Date;
  routeName?: string;
  notes?: string;
}

export interface VehicleProfile {
  id: string;
  name: string;
  vehicleType: string;
  fuelType: string;
  averageMileage: number;
  isDefault: boolean;
  createdAt: Date;
}

export interface ExportData {
  calculations: FuelCalculation[];
  profiles: VehicleProfile[];
  exportedAt: Date;
  totalCalculations: number;
  totalCost: number;
}

export enum FuelType {
  PETROL = 'Petrol',
  DIESEL = 'Diesel',
  CNG = 'CNG',
  ELECTRIC = 'Electric'
}

export interface FuelTypeInfo {
  type: FuelType;
  unit: string;
  icon: string;
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  FuelCalculation,
  VehicleProfile,
  ExportData,
  FuelType,
} from '../models/fuel-calculation.model';

@Injectable({
  providedIn: 'root',
})
export class DataStorageService {
  private readonly CALCULATIONS_KEY = 'fuel_calculations';
  private readonly PROFILES_KEY = 'vehicle_profiles';

  private calculationsSubject = new BehaviorSubject<FuelCalculation[]>(
    this.loadCalculations()
  );
  private profilesSubject = new BehaviorSubject<VehicleProfile[]>(
    this.loadProfiles()
  );

  calculations$ = this.calculationsSubject.asObservable();
  profiles$ = this.profilesSubject.asObservable();

  constructor() {
    // Initialize with default profiles if none exist
    if (this.loadProfiles().length === 0) {
      this.initializeDefaultProfiles();
    }
  }

  // Calculations Management
  saveCalculation(
    calculation: Omit<FuelCalculation, 'id' | 'calculatedAt'>
  ): FuelCalculation {
    const calculations = this.loadCalculations();
    const newCalculation: FuelCalculation = {
      ...calculation,
      id: this.generateId(),
      calculatedAt: new Date(),
    };

    calculations.unshift(newCalculation); // Add to beginning
    this.saveCalculations(calculations);
    this.calculationsSubject.next(calculations);

    return newCalculation;
  }

  getCalculations(): FuelCalculation[] {
    return this.loadCalculations();
  }

  deleteCalculation(id: string): void {
    const calculations = this.loadCalculations().filter(
      (calc) => calc.id !== id
    );
    this.saveCalculations(calculations);
    this.calculationsSubject.next(calculations);
  }

  clearAllCalculations(): void {
    this.saveCalculations([]);
    this.calculationsSubject.next([]);
  }

  // Vehicle Profiles Management
  saveProfile(
    profile: Omit<VehicleProfile, 'id' | 'createdAt'>
  ): VehicleProfile {
    const profiles = this.loadProfiles();

    // If this is set as default, remove default from others
    if (profile.isDefault) {
      profiles.forEach((p) => (p.isDefault = false));
    }

    const newProfile: VehicleProfile = {
      ...profile,
      id: this.generateId(),
      createdAt: new Date(),
    };

    profiles.push(newProfile);
    this.saveProfiles(profiles);
    this.profilesSubject.next(profiles);

    return newProfile;
  }

  updateProfile(id: string, updates: Partial<VehicleProfile>): void {
    const profiles = this.loadProfiles();
    const profileIndex = profiles.findIndex((p) => p.id === id);

    if (profileIndex !== -1) {
      // If setting as default, remove default from others
      if (updates.isDefault) {
        profiles.forEach((p) => (p.isDefault = false));
      }

      profiles[profileIndex] = { ...profiles[profileIndex], ...updates };
      this.saveProfiles(profiles);
      this.profilesSubject.next(profiles);
    }
  }

  deleteProfile(id: string): void {
    const profiles = this.loadProfiles().filter((profile) => profile.id !== id);
    this.saveProfiles(profiles);
    this.profilesSubject.next(profiles);
  }

  getDefaultProfile(): VehicleProfile | null {
    return this.loadProfiles().find((p) => p.isDefault) || null;
  }

  // Export functionality
  exportData(): ExportData {
    const calculations = this.loadCalculations();
    const profiles = this.loadProfiles();

    return {
      calculations,
      profiles,
      exportedAt: new Date(),
      totalCalculations: calculations.length,
      totalCost: calculations.reduce((sum, calc) => sum + calc.totalCost, 0),
    };
  }

  exportToJSON(): string {
    return JSON.stringify(this.exportData(), null, 2);
  }

  exportToCSV(): string {
    const calculations = this.loadCalculations();
    if (calculations.length === 0) return '';

    const headers = [
      'Date',
      'Vehicle Type',
      'Fuel Type',
      'Mileage (km/l)',
      'Distance (km)',
      'Fuel Price (₹/l)',
      'Total Fuel (l)',
      'Total Cost (₹)',
      'Route Name',
      'Notes',
    ];

    const csvContent = [
      headers.join(','),
      ...calculations.map((calc) =>
        [
          calc.calculatedAt.toLocaleDateString(),
          calc.vehicleType,
          calc.fuelType,
          calc.mileage,
          calc.distance,
          calc.fuelPrice,
          calc.totalFuel.toFixed(2),
          calc.totalCost.toFixed(2),
          calc.routeName || '',
          calc.notes || '',
        ].join(',')
      ),
    ].join('\n');

    return csvContent;
  }

  // Private helper methods
  private loadCalculations(): FuelCalculation[] {
    try {
      const data = localStorage.getItem(this.CALCULATIONS_KEY);
      return data
        ? JSON.parse(data).map((calc: any) => ({
            ...calc,
            calculatedAt: new Date(calc.calculatedAt),
          }))
        : [];
    } catch {
      return [];
    }
  }

  private saveCalculations(calculations: FuelCalculation[]): void {
    localStorage.setItem(this.CALCULATIONS_KEY, JSON.stringify(calculations));
  }

  private loadProfiles(): VehicleProfile[] {
    try {
      const data = localStorage.getItem(this.PROFILES_KEY);
      return data
        ? JSON.parse(data).map((profile: any) => ({
            ...profile,
            createdAt: new Date(profile.createdAt),
          }))
        : [];
    } catch {
      return [];
    }
  }

  private saveProfiles(profiles: VehicleProfile[]): void {
    localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private initializeDefaultProfiles(): void {
    const defaultProfiles: Omit<VehicleProfile, 'id' | 'createdAt'>[] = [
      {
        name: 'My Bike',
        vehicleType: 'Bike',
        fuelType: FuelType.PETROL,
        averageMileage: 45,
        isDefault: true,
      },
      {
        name: 'My Car',
        vehicleType: 'Car',
        fuelType: FuelType.PETROL,
        averageMileage: 15,
        isDefault: false,
      },
    ];

    defaultProfiles.forEach((profile) => this.saveProfile(profile));
  }
}

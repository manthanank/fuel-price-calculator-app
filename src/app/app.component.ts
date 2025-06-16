import {
  Component,
  signal,
  computed,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { TrackService } from './services/track.service';
import { DataStorageService } from './services/data-storage.service';
import { ExportService } from './services/export.service';
import { Visit } from './models/visit.model';
import {
  FuelCalculation,
  VehicleProfile,
  FuelType,
  FuelTypeInfo,
} from './models/fuel-calculation.model';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'fuel-price-calculator';
  private document = inject(DOCUMENT);
  private trackService = inject(TrackService);
  private dataStorage = inject(DataStorageService);
  private exportService = inject(ExportService);

  vehicles = ['Bike', 'Car', 'Truck', 'Bus', 'Van'];

  fuelTypes: FuelTypeInfo[] = [
    { type: FuelType.PETROL, unit: '₹/liter', icon: '⛽' },
    { type: FuelType.DIESEL, unit: '₹/liter', icon: '🚛' },
    { type: FuelType.CNG, unit: '₹/kg', icon: '🌿' },
    { type: FuelType.ELECTRIC, unit: '₹/kWh', icon: '⚡' },
  ];

  // Current tab/view management
  activeTab = signal<'calculator' | 'history' | 'profiles'>('calculator');

  // Define state with signals
  selectedVehicle = signal<string>('');
  selectedFuelType = signal<FuelType>(FuelType.PETROL);
  mileage = signal<number | null>(null);
  distance = signal<number | null>(null);
  petrolPrice = signal<number | null>(null);
  routeName = signal<string>('');
  notes = signal<string>('');
  formSubmitted = signal<boolean>(false);

  // Vehicle profiles
  vehicleProfiles = signal<VehicleProfile[]>([]);
  selectedProfile = signal<VehicleProfile | null>(null);
  showProfileForm = signal<boolean>(false);
  editingProfile = signal<VehicleProfile | null>(null);

  // New profile form
  newProfileName = signal<string>('');
  newProfileVehicle = signal<string>('');
  newProfileFuelType = signal<FuelType>(FuelType.PETROL);
  newProfileMileage = signal<number | null>(null);
  newProfileIsDefault = signal<boolean>(false);

  // Trip history
  fuelCalculations = signal<FuelCalculation[]>([]);
  showHistoryDetails = signal<string | null>(null);

  // Visitor count state
  visitorCount = signal<number>(0);
  isVisitorCountLoading = signal<boolean>(false);
  visitorCountError = signal<string | null>(null);

  // Theme state
  darkMode = signal<boolean>(false);

  constructor() {
    // Initialize theme based on user preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    // Set initial dark mode state
    this.darkMode.set(savedTheme === 'dark' || (!savedTheme && prefersDark));

    // Update document class when dark mode changes
    effect(() => {
      if (this.darkMode()) {
        this.document.documentElement.classList.add('dark');
      } else {
        this.document.documentElement.classList.remove('dark');
      }
      // Save preference to localStorage
      localStorage.setItem('theme', this.darkMode() ? 'dark' : 'light');
    });
  }
  ngOnInit(): void {
    this.trackVisit();
    this.loadData();
  }

  private loadData(): void {
    // Load vehicle profiles
    this.dataStorage.profiles$.subscribe((profiles) => {
      this.vehicleProfiles.set(profiles);

      // Auto-select default profile if available
      const defaultProfile = profiles.find((p) => p.isDefault);
      if (defaultProfile && !this.selectedProfile()) {
        this.loadProfileData(defaultProfile);
      }
    });

    // Load calculation history
    this.dataStorage.calculations$.subscribe((calculations) => {
      this.fuelCalculations.set(calculations);
    });
  }

  private trackVisit(): void {
    this.isVisitorCountLoading.set(true);
    this.visitorCountError.set(null);

    this.trackService.trackProjectVisit(this.title).subscribe({
      next: (response: Visit) => {
        this.visitorCount.set(response.uniqueVisitors);
        this.isVisitorCountLoading.set(false);
      },
      error: (err: Error) => {
        console.error('Failed to track visit:', err);
        this.visitorCountError.set('Failed to load visitor count');
        this.isVisitorCountLoading.set(false);
      },
    });
  }

  // Computed values that are guaranteed to return a number (never null)
  totalFuel = computed<number>(() => {
    if (!this.isFormValid()) return 0;
    return this.distance()! / this.mileage()!;
  });

  totalCost = computed<number>(() => {
    if (!this.isFormValid()) return 0;
    return this.totalFuel() * this.petrolPrice()!;
  });
  // Toggle theme method
  toggleTheme() {
    this.darkMode.update((current: boolean) => !current);
  }

  // Tab navigation
  setActiveTab(tab: 'calculator' | 'history' | 'profiles') {
    this.activeTab.set(tab);
  }

  // Fuel type methods
  updateFuelType(fuelType: FuelType) {
    this.selectedFuelType.set(fuelType);
  }

  getCurrentFuelTypeInfo(): FuelTypeInfo {
    return (
      this.fuelTypes.find((ft) => ft.type === this.selectedFuelType()) ||
      this.fuelTypes[0]
    );
  }

  // Vehicle profile methods
  loadProfileData(profile: VehicleProfile) {
    this.selectedProfile.set(profile);
    this.selectedVehicle.set(profile.vehicleType);
    this.selectedFuelType.set(profile.fuelType as FuelType);
    this.mileage.set(profile.averageMileage);
  }

  showCreateProfileForm() {
    this.showProfileForm.set(true);
    this.editingProfile.set(null);
    this.resetProfileForm();
  }

  showEditProfileForm(profile: VehicleProfile) {
    this.showProfileForm.set(true);
    this.editingProfile.set(profile);
    this.newProfileName.set(profile.name);
    this.newProfileVehicle.set(profile.vehicleType);
    this.newProfileFuelType.set(profile.fuelType as FuelType);
    this.newProfileMileage.set(profile.averageMileage);
    this.newProfileIsDefault.set(profile.isDefault);
  }

  saveProfile() {
    if (
      !this.newProfileName() ||
      !this.newProfileVehicle() ||
      !this.newProfileMileage()
    ) {
      return;
    }

    const profileData = {
      name: this.newProfileName(),
      vehicleType: this.newProfileVehicle(),
      fuelType: this.newProfileFuelType(),
      averageMileage: this.newProfileMileage()!,
      isDefault: this.newProfileIsDefault(),
    };

    if (this.editingProfile()) {
      this.dataStorage.updateProfile(this.editingProfile()!.id, profileData);
    } else {
      this.dataStorage.saveProfile(profileData);
    }

    this.showProfileForm.set(false);
    this.resetProfileForm();
  }

  deleteProfile(profile: VehicleProfile) {
    if (confirm(`Are you sure you want to delete "${profile.name}"?`)) {
      this.dataStorage.deleteProfile(profile.id);
      if (this.selectedProfile()?.id === profile.id) {
        this.selectedProfile.set(null);
      }
    }
  }

  setDefaultProfile(profile: VehicleProfile) {
    this.dataStorage.updateProfile(profile.id, { isDefault: true });
  }

  resetProfileForm() {
    this.newProfileName.set('');
    this.newProfileVehicle.set('');
    this.newProfileFuelType.set(FuelType.PETROL);
    this.newProfileMileage.set(null);
    this.newProfileIsDefault.set(false);
  }

  cancelProfileForm() {
    this.showProfileForm.set(false);
    this.resetProfileForm();
  }

  // History methods
  toggleHistoryDetails(calculationId: string) {
    const current = this.showHistoryDetails();
    this.showHistoryDetails.set(
      current === calculationId ? null : calculationId
    );
  }

  deleteCalculation(calculation: FuelCalculation) {
    if (confirm('Are you sure you want to delete this calculation?')) {
      this.dataStorage.deleteCalculation(calculation.id);
    }
  }

  clearAllHistory() {
    if (confirm('Are you sure you want to clear all calculation history?')) {
      this.dataStorage.clearAllCalculations();
    }
  }

  // Export methods
  exportToJSON() {
    const data = this.dataStorage.exportData();
    this.exportService.downloadJSON(
      data,
      `fuel-calculations-${new Date().toISOString().split('T')[0]}`
    );
  }

  exportToCSV() {
    const csvContent = this.dataStorage.exportToCSV();
    if (csvContent) {
      this.exportService.downloadCSV(
        csvContent,
        `fuel-calculations-${new Date().toISOString().split('T')[0]}`
      );
    }
  }

  exportToPDF() {
    const calculations = this.fuelCalculations();
    if (calculations.length > 0) {
      this.exportService.downloadPDF(calculations);
    }
  }

  // Methods to update signals with proper type safety
  updateVehicle(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedVehicle.set(target.value);
  }

  updateMileage(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const parsedValue = value ? parseFloat(value) : null;

    // Ensure value is not negative
    if (parsedValue !== null && parsedValue < 0) {
      target.value = '0';
      this.mileage.set(0);
    } else {
      this.mileage.set(parsedValue);
    }
  }

  updateDistance(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const parsedValue = value ? parseFloat(value) : null;

    // Ensure value is not negative
    if (parsedValue !== null && parsedValue < 0) {
      target.value = '0';
      this.distance.set(0);
    } else {
      this.distance.set(parsedValue);
    }
  }

  updatePetrolPrice(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const parsedValue = value ? parseFloat(value) : null;

    // Ensure value is not negative
    if (parsedValue !== null && parsedValue < 0) {
      target.value = '0';
      this.petrolPrice.set(0);
    } else {
      this.petrolPrice.set(parsedValue);
    }
  }
  calculateCost() {
    this.formSubmitted.set(true);

    if (this.isFormValid()) {
      // Save the calculation to history
      const calculationData = {
        vehicleType: this.selectedVehicle(),
        fuelType: this.selectedFuelType(),
        mileage: this.mileage()!,
        distance: this.distance()!,
        fuelPrice: this.petrolPrice()!,
        totalFuel: this.totalFuel(),
        totalCost: this.totalCost(),
        routeName: this.routeName() || undefined,
        notes: this.notes() || undefined,
      };

      this.dataStorage.saveCalculation(calculationData);
    }
  }

  isFormValid(): boolean {
    return !!(
      this.selectedVehicle() &&
      this.mileage() &&
      this.mileage()! > 0 &&
      this.distance() &&
      this.distance()! > 0 &&
      this.petrolPrice() &&
      this.petrolPrice()! > 0
    );
  }
  resetForm() {
    this.selectedVehicle.set('');
    this.mileage.set(null);
    this.distance.set(null);
    this.petrolPrice.set(null);
    this.routeName.set('');
    this.notes.set('');
    this.formSubmitted.set(false);
    this.selectedProfile.set(null);
  }

  // Additional form update methods
  updateRouteName(event: Event) {
    const target = event.target as HTMLInputElement;
    this.routeName.set(target.value);
  }

  updateNotes(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.notes.set(target.value);
  }

  updateNewProfileName(event: Event) {
    const target = event.target as HTMLInputElement;
    this.newProfileName.set(target.value);
  }

  updateNewProfileVehicle(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.newProfileVehicle.set(target.value);
  }

  updateNewProfileMileage(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const parsedValue = value ? parseFloat(value) : null;
    if (parsedValue !== null && parsedValue < 0) {
      target.value = '0';
      this.newProfileMileage.set(0);
    } else {
      this.newProfileMileage.set(parsedValue);
    }
  }

  updateNewProfileFuelType(fuelType: FuelType) {
    this.newProfileFuelType.set(fuelType);
  }

  updateNewProfileIsDefault(event: Event) {
    const target = event.target as HTMLInputElement;
    this.newProfileIsDefault.set(target.checked);
  }
}

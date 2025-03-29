import { Component, signal, computed, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'fuel-price-calculator';
  private document = inject(DOCUMENT);

  vehicles = ['Bike', 'Car', 'Truck', 'Bus', 'Van'];

  // Define state with signals
  selectedVehicle = signal<string>('');
  mileage = signal<number | null>(null);
  distance = signal<number | null>(null);
  petrolPrice = signal<number | null>(null);
  formSubmitted = signal<boolean>(false);

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
    this.darkMode.update((current) => !current);
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
    this.formSubmitted.set(false);
  }
}

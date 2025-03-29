import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'petrol-price-calculator';

  vehicleTypes = [
    { name: 'Bike', mileage: 40 }, // km per liter
    { name: 'Car', mileage: 15 },
  ];
  
  selectedVehicle = this.vehicleTypes[0];
  distance = 0;
  petrolPrice = 0;
  totalFuel = 0;
  totalCost = 0;

  calculateCost() {
    if (this.distance > 0 && this.petrolPrice > 0) {
      this.totalFuel = this.distance / this.selectedVehicle.mileage;
      this.totalCost = this.totalFuel * this.petrolPrice;
    }
  }
}

# Fuel Price Calculator

A modern, responsive web application built with Angular that helps users calculate, track, and manage fuel costs for their journeys.

## Features

### 🧮 **Enhanced Calculator**

- Calculate total fuel required and cost for your trip
- Support for different vehicle types (Bike, Car, Truck, Bus, Van)
- **NEW:** Multiple fuel type support (Petrol, Diesel, CNG, Electric)
- Input validation to ensure accurate calculations
- Optional route naming and notes for better tracking

### 🚗 **Vehicle Profiles**

- Create and manage multiple vehicle profiles
- Store vehicle type, fuel type, and average mileage
- Set default profiles for quick calculations
- Edit and delete existing profiles
- Quick-select profiles for instant form filling

### 📊 **Trip History & Analytics**

- Automatically save all calculations
- View detailed calculation history
- Track fuel expenses over time
- Search and filter past calculations
- Detailed trip information with notes

### 📄 **Export Functionality**

- Export calculation history to CSV format
- Export data to JSON for backup/import
- Generate PDF reports for expense tracking
- Professional formatting for business use

### 🎨 **User Experience**

- Responsive design that works on mobile and desktop
- Dark mode support with theme persistence
- Clean, intuitive tabbed interface
- Real-time form validation
- Modern design using TailwindCSS

### 🔧 **Technical Features**

- Signal-based reactive state management
- Local storage for data persistence
- Type-safe TypeScript implementation
- Component-based architecture

## Technologies Used

- **Angular 19** - Frontend framework with signal-based reactivity
- **TailwindCSS 4** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:4200`

## How to Use

### 1. **Calculator Tab**

- Select or create a vehicle profile for quick setup
- Choose your fuel type (Petrol, Diesel, CNG, or Electric)
- Enter vehicle type, mileage, distance, and fuel price
- Add optional route name and notes
- Click "Calculate & Save" to compute costs and save to history

### 2. **History Tab**

- View all your past calculations
- Export data in CSV, JSON, or PDF format
- Delete individual calculations or clear entire history
- Click on entries to view detailed information

### 3. **Profiles Tab**

- Create vehicle profiles with default settings
- Set a profile as default for automatic form filling
- Edit or delete existing profiles
- Quick-use profiles directly in calculator

## Data Storage

All data is stored locally in your browser using localStorage. Your calculations and vehicle profiles persist between sessions but remain private to your device.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

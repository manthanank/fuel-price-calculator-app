import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  downloadFile(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  }

  downloadJSON(data: any, filename: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
  }

  downloadCSV(csvContent: string, filename: string): void {
    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  }

  downloadPDF(calculations: any[]): void {
    // For now, we'll create a simple HTML version that can be printed as PDF
    const htmlContent = this.generatePDFContent(calculations);
    const newWindow = window.open('', '_blank');

    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.focus();
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  }

  private generatePDFContent(calculations: any[]): string {
    const totalCost = calculations.reduce(
      (sum, calc) => sum + calc.totalCost,
      0
    );

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fuel Calculations Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2563eb; text-align: center; }
          .summary { background: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #2563eb; color: white; }
          .total { font-weight: bold; background-color: #f9fafb; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>⛽ Fuel Calculations Report</h1>
        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Total Calculations:</strong> ${calculations.length}</p>
          <p><strong>Total Cost:</strong> ₹${totalCost.toFixed(2)}</p>
          <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Vehicle</th>
              <th>Fuel Type</th>
              <th>Distance (km)</th>
              <th>Fuel (L)</th>
              <th>Cost (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${calculations
              .map(
                (calc) => `
              <tr>
                <td>${new Date(calc.calculatedAt).toLocaleDateString()}</td>
                <td>${calc.vehicleType}</td>
                <td>${calc.fuelType}</td>
                <td>${calc.distance}</td>
                <td>${calc.totalFuel.toFixed(2)}</td>
                <td>₹${calc.totalCost.toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
            <tr class="total">
              <td colspan="5"><strong>Total</strong></td>
              <td><strong>₹${totalCost.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;
  }
}

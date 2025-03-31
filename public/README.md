# Novo Nordisk Manufacturing Dashboard

A comprehensive dashboard application for monitoring manufacturing data and right-first-time (RFT) metrics for Novo Nordisk.

## Architecture

The dashboard is built with the following architecture:

1. **Data Processing Layer**
   - Excel files are processed during the build phase using `ExcelProcessor.js`
   - Raw data from Excel files is transformed into a structured JSON format
   - Generated JSON is saved to `public/data/complete-data.json` with a fallback copy at `/complete-data.json`

2. **Data Context Provider**
   - React Context API is used for centralized data management (DataContext.js)
   - Data is fetched from JSON endpoints with retry and fallback mechanisms
   - AppWithContext.js handles data loading and provides it to all components

3. **Component Layer**
   - Modular components each handling specific data visualization needs
   - All components consume data through the DataContext
   - Every component handles loading and error states appropriately

4. **Visualization & Analytics**
   - Recharts library is used for interactive charts
   - Custom metrics calculations are performed in components
   - Responsive design adapts to various screen sizes

## Setup and Development

1. **Prerequisites**
   - Node.js 18.x or higher
   - npm 9.x or higher

2. **Installation**
   ```
   npm install
   ```

3. **Development**
   ```
   npm start
   ```

4. **Building**
   ```
   npm run build
   ```

5. **Data Generation**
   ```
   npm run generate-data
   ```

## Data Sources

The dashboard processes data from three main Excel files:
- Internal RFT.xlsx - Internal right-first-time metrics
- External RFT.xlsx - Customer complaints and external issues
- Commercial Process.xlsx - Production lot data and process metrics

## Features

- Overall RFT rate analysis
- Form error analysis
- Customer complaint tracking
- Process flow visualization
- Lot analytics
- Insights dashboard

## Deployment

The dashboard is deployed to Netlify with automated data processing during the build phase. The build configuration is defined in `netlify.toml`.

# Dashboard Data Preprocessing

This project includes a script to preprocess Excel data for the dashboard visualization. The script extracts data from Excel files and converts it to JSON format for use by the dashboard.

## Prerequisites

- **Node.js**: Must be installed on your system. Download from [nodejs.org](https://nodejs.org/).
- **Excel files**: Place your Excel files in the root directory with the following names:
  - `Internal RFT.xlsx`
  - `External RFT.xlsx`
  - `Commercial Process.xlsx`

## Installation

1. Install Node.js if not already installed
2. Install required dependencies:
   ```
   npm install xlsx
   ```

## Running the Script

1. Open a command prompt or PowerShell in the project directory
2. Run the preprocessing script:
   ```
   node fixed-preprocess-excel.js
   ```
3. The script will:
   - Read data from your Excel files
   - Extract and process the actual Excel content (not sample data)
   - Generate JSON files in the `public/data` directory
   - Show detailed logs about what it's processing

## Excel File Structure

The script is configured to read Excel files with the following expected columns:

### Internal RFT.xlsx
- ID
- Date
- Lot
- Product
- Department
- ErrorType
- Status
- Impact
- Resolution (for timeToResolution)
- Comments
- FormType (optional)

### External RFT.xlsx
- ID
- Date
- Customer
- Product
- Category or IssueCategory
- Description or Issue
- Severity
- Status
- Comments or CustomerFeedback

### Commercial Process.xlsx
- ID
- Lot or LotNumber
- Product
- StartDate or Date
- ReleaseDate or CompletionDate
- Department
- Status
- ReviewTime
- CycleTime
- ProcessStep or Step
- Time or Duration
- ReviewType
- TargetTime or Target

## Troubleshooting

- If the script doesn't find your Excel files, verify they are named correctly and placed in the same directory as the script.
- If the script can't read the Excel files properly, check that they are not password-protected or corrupted.
- If you get errors about missing columns, the script provides fallbacks but may not generate accurate visualizations of your data. Ensure your Excel files have the expected column names or modify the script to match your column names. 
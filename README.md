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
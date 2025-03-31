const fs = require('fs');
const path = require('path');

console.log('Starting dashboard data generation from Excel files...');
console.log('Working directory:', process.cwd());

// Ensure source directory exists
const srcDir = path.resolve(process.cwd(), 'src');
if (!fs.existsSync(srcDir)) {
  console.error('ERROR: src directory not found!');
  process.exit(1);
}

// Ensure Excel files exist
const excelFiles = [
  'Internal RFT.xlsx',
  'External RFT.xlsx',
  'Commercial Process.xlsx'
];

for (const file of excelFiles) {
  const filePath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.error(`ERROR: Required Excel file not found: ${file}`);
    process.exit(1);
  }
  console.log(`Found Excel file: ${file}`);
}

// Import the Excel processor
console.log('Importing ExcelProcessor...');
const ExcelProcessor = require('./src/ExcelProcessor');
console.log('Successfully imported ExcelProcessor');

// Create public data directory
const dataDir = path.resolve(process.cwd(), 'public/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Created directory: ${dataDir}`);
}

// Process the Excel files
console.log('Starting Excel processing...');
const processor = new ExcelProcessor({
  internalRftPath: path.resolve(process.cwd(), 'Internal RFT.xlsx'),
  externalRftPath: path.resolve(process.cwd(), 'External RFT.xlsx'),
  commercialProcessPath: path.resolve(process.cwd(), 'Commercial Process.xlsx'),
  outputPath: path.resolve(process.cwd(), 'public/data/complete-data.json')
});

// Process the data
(async () => {
  try {
    const data = await processor.processAll();
    console.log('Data processing completed successfully.');
    
    // Create fallback copy
    fs.copyFileSync(
      path.resolve(process.cwd(), 'public/data/complete-data.json'),
      path.resolve(process.cwd(), 'public/complete-data.json')
    );
    
    console.log('Dashboard data generation completed successfully!');
    console.log('Files generated:');
    console.log('- public/data/complete-data.json');
    console.log('- public/complete-data.json (fallback copy)');
  } catch (error) {
    console.error('Fatal error during data processing:', error);
    process.exit(1);
  }
})(); 
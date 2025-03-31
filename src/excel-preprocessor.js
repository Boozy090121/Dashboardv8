// scripts/preprocess-excel.js
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const NovoNordiskExcelProcessor = require('../src/ExcelProcessor').default;

// Create directory for processed data
const OUTPUT_DIR = path.join(__dirname, '../src/processed-data');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Initialize the processor
const processor = new NovoNordiskExcelProcessor();

// Files to process
const files = [
  { name: "Internal RFT.xlsx", type: "internal" },
  { name: "External RFT.xlsx", type: "external" },
  { name: "Commercial Process.xlsx", type: "process" }
];

// Process each file
files.forEach(file => {
  try {
    console.log(`Processing ${file.name}...`);
    
    // Read the Excel file
    const excelFile = path.join(__dirname, '../data', file.name);
    const fileData = fs.readFileSync(excelFile);
    
    // Process with the Excel processor
    processor.processExcelFile(fileData, file.type);
    
    // Output to individual JSON file for the file type
    const outputFile = path.join(OUTPUT_DIR, `${file.type}.json`);
    fs.writeFileSync(outputFile, JSON.stringify({
      type: file.type,
      processedData: processor.getProcessedData()
    }, null, 2));
    
    console.log(`Successfully processed ${file.name} to ${outputFile}`);
  } catch (error) {
    console.error(`Error processing ${file.name}:`, error);
  }
});

// Write the complete processed data as a combined file
try {
  const processedData = processor.getProcessedData();
  const outputFile = path.join(OUTPUT_DIR, 'complete-data.json');
  fs.writeFileSync(outputFile, JSON.stringify(processedData, null, 2));
  console.log(`Successfully wrote combined data to ${outputFile}`);
} catch (error) {
  console.error('Error writing combined data:', error);
}

console.log('Excel preprocessing complete!');

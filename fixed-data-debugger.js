// scripts/data-debugger.js
const fs = require('fs');
const path = require('path');

// Utility to check for the existence of key files and directories
console.log('===== DATA DEBUGGING TOOL =====');
console.log('Current working directory:', process.cwd());

// Check public directory structure
console.log('\nChecking public directory structure:');
const publicDir = path.join(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  console.log('✓ public directory exists');
  
  // Check for data subdirectory
  const dataDir = path.join(publicDir, 'data');
  if (fs.existsSync(dataDir)) {
    console.log('✓ public/data directory exists');
    
    // List files in data directory
    const files = fs.readdirSync(dataDir);
    console.log(`Found ${files.length} files in public/data directory:`);
    files.forEach(file => {
      const filePath = path.join(dataDir, file);
      const stats = fs.statSync(filePath);
      console.log(`- ${file} (${stats.size} bytes)`);
      
      // If it's the complete-data.json file, check its content
      if (file === 'complete-data.json') {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          console.log('  ✓ complete-data.json is valid JSON');
          console.log('  Structure check:');
          console.log('    - has overview:', !!data.overview);
          console.log('    - has internalRFT:', !!data.internalRFT);
          console.log('    - has externalRFT:', !!data.externalRFT);
          console.log('    - has processMetrics:', !!data.processMetrics);
          console.log('    - has lotData:', !!data.lotData);
        } catch (err) {
          console.log('  ✗ complete-data.json is NOT valid JSON', err.message);
        }
      }
    });
  } else {
    console.log('✗ public/data directory does NOT exist');
  }
  
  // Check for fallback location
  const fallbackPath = path.join(publicDir, 'complete-data.json');
  if (fs.existsSync(fallbackPath)) {
    const stats = fs.statSync(fallbackPath);
    console.log(`✓ public/complete-data.json fallback exists (${stats.size} bytes)`);
    
    try {
      const data = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      console.log('  ✓ fallback complete-data.json is valid JSON');
    } catch (err) {
      console.log('  ✗ fallback complete-data.json is NOT valid JSON', err.message);
    }
  } else {
    console.log('✗ public/complete-data.json fallback does NOT exist');
  }
} else {
  console.log('✗ public directory does NOT exist');
}

// Check base data files
console.log('\nChecking for Excel source files:');
const excelFiles = [
  'Internal RFT.xlsx',
  'External RFT.xlsx',
  'Commercial Process.xlsx'
];

excelFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✓ ${file} exists (${stats.size} bytes)`);
  } else {
    console.log(`✗ ${file} does NOT exist`);
  }
});

// Check scripts
console.log('\nChecking preprocessing scripts:');
const scripts = [
  'preprocess-excel.js',
  'debug-preprocess.js',
  'generate-dashboard-data.js'
];

scripts.forEach(script => {
  const filePath = path.join(process.cwd(), script);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✓ ${script} exists (${stats.size} bytes)`);
  } else {
    console.log(`✗ ${script} does NOT exist`);
  }
});

// Check if data is being generated in build process
console.log('\nChecking package.json build scripts:');
try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    console.log('Scripts:');
    if (packageJson.scripts) {
      console.log('- build:', packageJson.scripts.build || 'Not defined');
      console.log('- prebuild:', packageJson.scripts.prebuild || 'Not defined');
      console.log('- preprocess:', packageJson.scripts.preprocess || 'Not defined');
      console.log('- generate-data:', packageJson.scripts['generate-data'] || 'Not defined');
    } else {
      console.log('No scripts defined in package.json');
    }
  } else {
    console.log('✗ package.json does NOT exist');
  }
} catch (err) {
  console.log('Error reading package.json:', err.message);
}

console.log('\n===== DEBUGGING COMPLETE =====');

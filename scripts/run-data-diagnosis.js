// scripts/run-data-diagnosis.js
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('===== DASHBOARD DATA DIAGNOSIS =====');

// Check if key directories exist
console.log('\nChecking key directories and files...');
const rootDir = process.cwd();
console.log('Root directory:', rootDir);

// Define files to check
const filesToCheck = [
  './debug-preprocess.js',
  './generate-dashboard-data.js',
  './public/data/complete-data.json',
  './public/complete-data.json',
  './scripts/data-debugger.js'
];

filesToCheck.forEach(file => {
  const filePath = path.join(rootDir, file);
  try {
    const exists = fs.existsSync(filePath);
    const status = exists ? '✓' : '✗';
    const stats = exists ? `(${fs.statSync(filePath).size} bytes)` : '(missing)';
    console.log(`${status} ${file} ${stats}`);
  } catch (error) {
    console.log(`✗ ${file} (error: ${error.message})`);
  }
});

// Run the data debugger
console.log('\nRunning data debugger...');
exec('node scripts/data-debugger.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error running data debugger: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Data debugger stderr: ${stderr}`);
  }
  
  console.log(stdout);
  
  // Check fix status
  console.log('\n===== DIAGNOSIS SUMMARY =====');
  console.log('1. If data debugger found issues:');
  console.log('   - Ensure Excel files are present in the root directory');
  console.log('   - Run "npm run generate-data" to regenerate data');
  console.log('   - Check that public/data/complete-data.json was created');
  console.log('\n2. If you\'re seeing context provider errors:');
  console.log('   - Check that DataContext.js has correct imports');
  console.log('   - Verify that components are importing from ./DataContext.js');
  console.log('   - Make sure App.js is using the DataProvider correctly');
  console.log('\n3. For deployment issues:');
  console.log('   - Check netlify.toml for correct build commands');
  console.log('   - Ensure generate-dashboard-data.js script is working');
  console.log('   - Verify Excel files are included in the repository');
  
  console.log('\n===== DIAGNOSIS COMPLETE =====');
}); 
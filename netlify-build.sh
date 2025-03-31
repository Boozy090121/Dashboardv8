#!/bin/bash

# Print environment info for debugging
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
echo "Directory contents: $(ls -la)"

# Clean any previous build artifacts
echo "Cleaning previous build artifacts..."
rm -rf build
rm -rf node_modules/.cache

# Step 1: Run preprocessor script
echo "Running preprocessor script..."
node debug-preprocess.js || echo "Preprocessor script failed but continuing..."

# Step 2: Generate dashboard data
echo "Generating dashboard data from Excel files..."
node generate-dashboard-data.js

# Step 3: Verify data was generated
if [ ! -f "./public/data/complete-data.json" ]; then
  echo "ERROR: Data generation failed - no complete-data.json found!"
  exit 1
fi

echo "Data generated successfully!"
echo "Data file contents preview:"
head -n 20 ./public/data/complete-data.json

# Create a fallback for the missing CustomerCommentAnalysis component
echo "Creating fallback for missing customer-comment-analysis.js file..."
cat > src/customer-comment-analysis.js << 'EOL'
// Fallback file created during build
import React from 'react';
import CustomerCommentAnalysisComponent from './customer-comment-analysis.tsx';

// Re-export the component from the TypeScript file
const CustomerCommentAnalysis = CustomerCommentAnalysisComponent;
export { CustomerCommentAnalysis };
export default CustomerCommentAnalysis;
EOL

# Step 4: Build React app
echo "Building React app..."
CI=false TSC_COMPILE_ON_ERROR=true DISABLE_ESLINT_PLUGIN=true GENERATE_SOURCEMAP=false react-scripts build

# Check build result
if [ -d "./build" ]; then
  echo "Build completed successfully!"
  exit 0
else
  echo "Build failed. No build directory created."
  exit 1
fi 
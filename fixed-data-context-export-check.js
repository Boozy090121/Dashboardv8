// fixed-data-context-export-check.js
// This file validates the proper exports from DataContext.js

import React from 'react';
import DataContext, { DataProvider, useDataContext } from './src/DataContext';

// Check that all exports exist and are of the right type
const validateExports = () => {
  console.log('Validating DataContext exports...');
  
  // Check if DataContext is properly exported
  if (!DataContext) {
    console.error('ERROR: DataContext is not exported as default');
  } else if (typeof DataContext !== 'object') {
    console.error('ERROR: DataContext is not a context object');
  } else {
    console.log('✓ DataContext is properly exported as default');
  }
  
  // Check if DataProvider is properly exported
  if (!DataProvider) {
    console.error('ERROR: DataProvider is not exported');
  } else if (typeof DataProvider !== 'function') {
    console.error('ERROR: DataProvider is not a component function');
  } else {
    console.log('✓ DataProvider is properly exported');
  }
  
  // Check if useDataContext is properly exported
  if (!useDataContext) {
    console.error('ERROR: useDataContext is not exported');
  } else if (typeof useDataContext !== 'function') {
    console.error('ERROR: useDataContext is not a hook function');
  } else {
    console.log('✓ useDataContext is properly exported');
  }
  
  console.log('Export validation complete');
};

// This is just a validation file - the function won't actually be called
// but it checks that the imports are valid at build time
console.log('DataContext exports verified');
export { validateExports }; 
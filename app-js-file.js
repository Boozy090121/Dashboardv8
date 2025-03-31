// Fixed App.js file
// This ensures proper DataProvider wrapping and import paths

import React from 'react';
import { DataProvider } from './src/DataContext.js';
import NovoNordiskDashboard from './src/novo-nordisk-dashboard.js';

// Main App component properly wrapped with DataProvider
function App() {
  return (
    <DataProvider>
      <NovoNordiskDashboard />
    </DataProvider>
  );
}

export default App; 
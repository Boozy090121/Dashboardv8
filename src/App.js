import React from 'react';
import NovoNordiskDashboard from './novo-nordisk-dashboard';
import { DataProvider } from './DataContext.js';

// Main App component - Directly wraps the dashboard with DataProvider
const App = () => {
  return (
    <DataProvider>
      <NovoNordiskDashboard />
    </DataProvider>
  );
};

export default App; 
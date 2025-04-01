import React from 'react';
import { DataProvider } from './DataContext.js';
import EnhancedOverviewDashboard from './enhanced-overview-dashboard';

// Main App component
const App = () => {
  return (
    <DataProvider>
      <div className="app-container p-4 bg-gray-50 min-h-screen">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Novo Nordisk Manufacturing Dashboard</h1>
        </header>
        <EnhancedOverviewDashboard />
      </div>
    </DataProvider>
  );
};

export default App; 
import React from 'react';
import { DataProvider } from './DataContext';
import NovoNordiskDashboard from './novo-nordisk-dashboard.js';

/**
 * ContextWrapper - A simpler alternative to AppWithContext
 * This component ensures that all dashboard components are wrapped
 * with the DataProvider from DataContext.js.
 */
const ContextWrapper = ({ contextValue }) => {
  return (
    <DataProvider value={contextValue}>
      <NovoNordiskDashboard />
    </DataProvider>
  );
};

export default ContextWrapper; 
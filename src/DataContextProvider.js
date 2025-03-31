import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // The shared state that will be available to our components
  const [dataState, setDataState] = useState({
    isLoading: true,
    error: null,
    data: null,
    lastUpdated: null
  });

  // Generate mock data
  const generateMockData = () => {
    // Generate mock data
    const mockData = {
      overview: {
        totalRecords: 1245,
        totalLots: 78,
        overallRFTRate: 92.3
      }
    };

    return mockData;
  };

  // Load mock data on mount
  useEffect(() => {
    setTimeout(() => {
      setDataState({
        isLoading: false,
        error: null,
        data: generateMockData(),
        lastUpdated: new Date()
      });
    }, 1000);
  }, []);

  // Value to be provided to consumers
  const contextValue = {
    isLoading: dataState.isLoading,
    error: dataState.error,
    data: dataState.data,
    lastUpdated: dataState.lastUpdated,
    refreshData: () => {}
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

export default DataContext; 
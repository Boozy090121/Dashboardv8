import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// Create the context
const DataContext = createContext(undefined);

// Custom hook to use the data context
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

// Provider component with data fetching logic
export const DataProvider = ({ children }) => {
  // State for the data
  const [state, setState] = useState({
    isLoading: true,
    error: null,
    data: null,
    lastUpdated: null,
    fileStatus: {
      "complete-data.json": { loaded: false, status: 'pending' }
    }
  });

  // Wrap loadData in useCallback
  const loadData = useCallback(async () => {
    // Initial loading state
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      fileStatus: {
        ...prev.fileStatus,
        "complete-data.json": { loaded: false, status: 'loading' }
      }
    }));
    console.log("Starting to load JSON data...");

    // Fetch data with a retry mechanism
    const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          // Throw an error that includes the status code
          throw new Error(`Failed to load data: ${response.statusText} (${response.status}) from ${url}`);
        }
        return await response.json();
      } catch (error) {
        if (retries > 0) {
          console.log(`Retrying fetch... (${retries} attempts left) for ${url}`);
          await new Promise(resolve => setTimeout(resolve, delay));
          // Increase delay for next retry
          return fetchWithRetry(url, retries - 1, delay * 1.5); 
        }
        // Re-throw the error after retries are exhausted
        throw error; 
      }
    };
    
    let finalStateUpdate = {};

    try {
      // Try the primary location ONLY
      const primaryUrl = `${window.location.origin}/data/complete-data.json`;
      console.log(`Attempting to load from primary source: ${primaryUrl}`);
      const jsonData = await fetchWithRetry(primaryUrl);
      console.log("Successfully loaded complete data");
      
      // Prepare successful state update
      finalStateUpdate = {
        isLoading: false,
        error: null,
        data: jsonData,
        lastUpdated: new Date(),
        fileStatus: {
          "complete-data.json": { loaded: true, status: 'success' }
        }
      };

    } catch (error) {
      console.error("Error loading data from primary source:", error);
      
      // Prepare error state update
      finalStateUpdate = {
        isLoading: false,
        error: `Failed to load data: ${error.message}`, // Simplified error message
        data: null, // Ensure data is null on error
        lastUpdated: new Date(), // Still update lastUpdated time
        fileStatus: {
          "complete-data.json": { loaded: false, status: 'error', error: error.message }
        }
      };
    } finally {
      // Apply the final state update once
      setState(prevState => ({ ...prevState, ...finalStateUpdate }));
    }
  // Empty dependency array for useCallback as loadData's definition doesn't depend on props/state
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  // Ensure this runs only once on mount
  }, []); // Changed back to empty dependency array

  // Memoize the context value
  const contextValue = useMemo(() => ({
    isLoading: state.isLoading,
    error: state.error,
    data: state.data,
    fileStatus: state.fileStatus,
    lastUpdated: state.lastUpdated,
    // Add a wrapper function for logging refreshData calls
    refreshData: () => {
      console.log("*** refreshData called via context! ***"); // Add specific log
      loadData(); // Call the actual loadData
    }
  }), [
    state.isLoading, 
    state.error, 
    state.data, 
    state.fileStatus, 
    state.lastUpdated, 
    loadData // Keep loadData as dependency for the memo
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext; 
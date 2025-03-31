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

  // Load data on mount
  useEffect(() => {
    console.log("DataProvider mount useEffect triggered"); // Log mount effect
    
    // Create an AbortController to cancel the fetch if the component unmounts
    const abortController = new AbortController();
    
    // Pass the abort signal to loadData (needs modification to accept it)
    // loadData(abortController.signal); // << TEMPORARILY COMMENT OUT to prevent initial load
    console.log("TEMPORARILY SKIPPING loadData() on mount"); // Add log
    
    // Cleanup function to abort the fetch on unmount
    return () => {
      console.log("DataProvider unmounting - Aborting fetch");
      abortController.abort();
    };
  }, []); // Still run only on mount

  // Wrap loadData in useCallback
  // Modify loadData to accept and use the signal
  const loadData = useCallback(async (fetchSignal) => { // Accept signal
    console.log("loadData function called");
    
    let newLoading = true;
    let newError = null;
    let newData = null;
    let newFileStatus = { "complete-data.json": { loaded: false, status: 'loading' } };

    const fetchWithRetry = async (url, signal, retries = 0, delay = 1000) => { // Accept signal
      try {
        console.log(`>>> Attempting fetch for: ${url}`);
        // Pass the signal to the fetch options
        const response = await fetch(url, { signal }); 
        if (!response.ok) {
          // Check if the error was due to aborting
          if (signal?.aborted) {
            throw new Error('Fetch aborted');
          }
          throw new Error(`Failed to load data: ${response.statusText} (${response.status}) from ${url}`);
        }
        return await response.json();
      } catch (error) {
        // Don't throw an error if it was intentionally aborted
        if (error.name === 'AbortError') { 
          console.log('Fetch was aborted.');
          // We might want to return null or a specific indicator
          return null; // Or throw a specific error if needed elsewhere
        }
        throw error; 
      }
    };
    
    try {
      const primaryUrl = `${window.location.origin}/data/complete-data.json`;
      // Pass the signal down to fetchWithRetry
      const jsonData = await fetchWithRetry(primaryUrl, fetchSignal);
      
      // If fetch was aborted, jsonData will be null, handle appropriately
      if (jsonData !== null) { 
        console.log("Successfully loaded complete data via fetch");
        newLoading = false;
        newError = null;
        newData = jsonData;
        newFileStatus = { "complete-data.json": { loaded: true, status: 'success' } };
      } else {
        // Fetch was aborted, maybe keep loading or set a specific state?
        // For now, let's just avoid setting data and keep loading true? Or set error?
        // Let's treat abort like an error for simplicity now, though it's not really.
         newLoading = false; // Or maybe true if we want to retry?
         newError = `Fetch aborted`; 
         newData = null;
         newFileStatus = { "complete-data.json": { loaded: false, status: 'aborted' } };
      }

    } catch (error) {
      // Handle non-abort errors
      if (error.name !== 'AbortError') {
        console.error("Error during data fetch:", error);
        newLoading = false;
        newError = `Failed to load data: ${error.message}`;
        newData = null;
        newFileStatus = { "complete-data.json": { loaded: false, status: 'error', error: error.message } };
      }
      // If it was AbortError, it should have been handled inside the try block or fetchWithRetry
      
    } finally {
      console.log("Updating state in finally block");
      // Only update state if the fetch wasn't aborted mid-way 
      // (Checking if newError contains 'Fetch aborted' is a bit fragile, but works for now)
      if (newError !== 'Fetch aborted') { 
          setState(prevState => ({ 
            ...prevState, 
            isLoading: newLoading,
            error: newError,
            data: newData,
            lastUpdated: new Date(),
            fileStatus: {
               ...prevState.fileStatus,
               ...newFileStatus 
            }
          }));
      } else {
          console.log("Skipping final state update due to fetch abort.");
      }
    }
  }, []);

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
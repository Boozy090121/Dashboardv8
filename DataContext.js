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

  // Create a ref to store the current AbortController
  const abortControllerRef = React.useRef(null);

  // Load data on mount
  useEffect(() => {
    console.log("DataProvider mount useEffect triggered");
    
    // Create an AbortController to cancel the fetch if the component unmounts
    abortControllerRef.current = new AbortController();
    
    // Pass the abort signal to loadData
    loadData(abortControllerRef.current.signal);
    
    // Cleanup function to abort the fetch on unmount
    return () => {
      console.log("DataProvider unmounting - Aborting fetch");
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []); // Run only on mount

  // Wrap loadData in useCallback
  const loadData = useCallback(async (signal) => {
    console.log("loadData function called");
    
    // If there's an existing fetch in progress, abort it
    if (abortControllerRef.current && !signal) {
      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      signal = abortControllerRef.current.signal;
    }
    
    let newLoading = true;
    let newError = null;
    let newData = null;
    let newFileStatus = { "complete-data.json": { loaded: false, status: 'loading' } };

    // Update state to show loading
    setState(prevState => ({ 
      ...prevState, 
      isLoading: true,
      error: null,
      fileStatus: {
        ...prevState.fileStatus,
        "complete-data.json": { loaded: false, status: 'loading' }
      }
    }));

    const fetchWithRetry = async (url, signal, retries = 2, delay = 1000) => {
      try {
        console.log(`>>> Attempting fetch for: ${url}`);
        const response = await fetch(url, { signal });
        
        if (!response.ok) {
          if (signal?.aborted) {
            throw new Error('Fetch aborted');
          }
          throw new Error(`Failed to load data: ${response.statusText} (${response.status}) from ${url}`);
        }
        return await response.json();
      } catch (error) {
        if (error.name === 'AbortError') { 
          console.log('Fetch was aborted.');
          return null;
        }
        
        if (retries > 0) {
          console.log(`Retrying fetch (${retries} attempts left)...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(url, signal, retries - 1, delay * 1.5);
        }
        
        throw error;
      }
    };
    
    try {
      const primaryUrl = `${window.location.origin}/data/complete-data.json`;
      const jsonData = await fetchWithRetry(primaryUrl, signal);
      
      if (jsonData !== null) {
        console.log("Successfully loaded complete data via fetch");
        newLoading = false;
        newError = null;
        newData = jsonData;
        newFileStatus = { "complete-data.json": { loaded: true, status: 'success' } };
      } else {
        newLoading = false;
        newError = `Data fetch was aborted`;
        newData = null;
        newFileStatus = { "complete-data.json": { loaded: false, status: 'aborted' } };
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error during data fetch:", error);
        newLoading = false;
        newError = `Failed to load data: ${error.message}`;
        newData = null;
        newFileStatus = { "complete-data.json": { loaded: false, status: 'error', error: error.message } };
      }
    } finally {
      console.log("Updating state in finally block");
      if (!signal?.aborted) {
        setState(prevState => ({ 
          ...prevState, 
          isLoading: newLoading,
          error: newError,
          data: newData || prevState.data,
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
    refreshData: () => {
      console.log("*** refreshData called via context! ***");
      // Create a new AbortController for this refresh
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      loadData(abortControllerRef.current.signal);
    }
  }), [
    state.isLoading, 
    state.error, 
    state.data, 
    state.fileStatus, 
    state.lastUpdated, 
    loadData
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext; 
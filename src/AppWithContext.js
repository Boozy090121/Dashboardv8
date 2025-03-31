import React, { useState, useEffect } from 'react';
import ContextWrapper from './ContextWrapper';

// All-in-one component that combines everything
const AppWithContext = () => {
  // State for the data
  const [dataState, setDataState] = useState({
    isLoading: true,
    error: null,
    data: null,
    lastUpdated: null,
    fileStatus: {
      "complete-data.json": { loaded: false, status: 'pending' }
    }
  });

  // Load data function
  const loadData = async () => {
    try {
      console.log("Starting to load JSON data...");
      
      setDataState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        fileStatus: {
          ...prev.fileStatus,
          "complete-data.json": { loaded: false, status: 'loading' }
        }
      }));

      // Fetch data with a retry mechanism
      const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to load data: ${response.statusText} (${response.status})`);
          }
          return await response.json();
        } catch (error) {
          if (retries > 0) {
            console.log(`Retrying fetch... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, retries - 1, delay * 1.5);
          }
          throw error;
        }
      };
      
      try {
        // First try the preferred location
        const jsonData = await fetchWithRetry(`${window.location.origin}/data/complete-data.json`);
        console.log("Successfully loaded complete data");
        
        // Update state with the loaded data
        setDataState({
          isLoading: false,
          error: null,
          data: jsonData,
          lastUpdated: new Date(),
          fileStatus: {
            "complete-data.json": { loaded: true, status: 'success' }
          }
        });
      } catch (error) {
        console.error("Error loading data from primary source:", error);
        
        // Try fallback location
        try {
          console.log("Attempting to load from fallback location...");
          const jsonData = await fetchWithRetry(`${window.location.origin}/complete-data.json`);
          console.log("Successfully loaded data from fallback location");
          
          setDataState({
            isLoading: false,
            error: null,
            data: jsonData,
            lastUpdated: new Date(),
            fileStatus: {
              "complete-data.json": { loaded: true, status: 'success' }
            }
          });
        } catch (fallbackError) {
          console.error("Error loading data from fallback location:", fallbackError);
          
          // Set the error state without generating mock data
          setDataState({
            isLoading: false,
            error: `Error loading data: ${error.message}. Fallback also failed: ${fallbackError.message}`,
            data: null,
            lastUpdated: new Date(),
            fileStatus: {
              "complete-data.json": { loaded: false, status: 'error', error: error.message }
            }
          });
        }
      }
    } catch (error) {
      console.error("Top-level error:", error);
      setDataState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to load data: ${error.message}`
      }));
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Create the context value
  const contextValue = {
    isLoading: dataState.isLoading,
    error: dataState.error,
    data: dataState.data,
    fileStatus: dataState.fileStatus,
    lastUpdated: dataState.lastUpdated,
    refreshData: loadData
  };

  // Render the ContextWrapper with our context value
  return <ContextWrapper contextValue={contextValue} />;
};

export default AppWithContext; 
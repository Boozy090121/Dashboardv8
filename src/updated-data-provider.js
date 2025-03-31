// src/DataContextProvider.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import config from './config';

// Create context
const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // The shared state that will be available to our components
  const [dataState, setDataState] = useState({
    isLoading: true,
    error: null,
    data: null,
    lastUpdated: null,
    fileStatus: {
      "Internal RFT.xlsx": { loaded: false, status: 'pending' },
      "External RFT.xlsx": { loaded: false, status: 'pending' },
      "Commercial Process.xlsx": { loaded: false, status: 'pending' }
    }
  });

  // Function to load data
  const loadData = async () => {
    try {
      setDataState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      // In production, load preprocessed data
      let processedData;
      
      try {
        // Simulate a short loading delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update status to loading for all files
        setDataState(prev => ({
          ...prev,
          fileStatus: {
            "Internal RFT.xlsx": { loaded: false, status: 'loading' },
            "External RFT.xlsx": { loaded: false, status: 'loading' },
            "Commercial Process.xlsx": { loaded: false, status: 'loading' },
          }
        }));
        
        // In production or when using preprocessed data, load from the JSON
        const dataModule = await import('./processed-data/complete-data.json');
        processedData = dataModule.default;
        
        // Simulate sequential loading for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        setDataState(prev => ({
          ...prev,
          fileStatus: {
            ...prev.fileStatus,
            "Internal RFT.xlsx": { loaded: true, status: 'success' }
          }
        }));
        
        await new Promise(resolve => setTimeout(resolve, 300));
        setDataState(prev => ({
          ...prev,
          fileStatus: {
            ...prev.fileStatus,
            "External RFT.xlsx": { loaded: true, status: 'success' }
          }
        }));
        
        await new Promise(resolve => setTimeout(resolve, 300));
        setDataState(prev => ({
          ...prev,
          fileStatus: {
            ...prev.fileStatus,
            "Commercial Process.xlsx": { loaded: true, status: 'success' }
          }
        }));
      } catch (error) {
        console.error("Error loading preprocessed data:", error);
        
        // Fall back to mock data if available and enabled
        if (config.useMockData) {
          console.log("Falling back to mock data");
          processedData = generateMockData();
          
          // Update file statuses to error
          setDataState(prev => ({
            ...prev,
            fileStatus: {
              "Internal RFT.xlsx": { loaded: false, status: 'error', error: 'Failed to load data' },
              "External RFT.xlsx": { loaded: false, status: 'error', error: 'Failed to load data' },
              "Commercial Process.xlsx": { loaded: false, status: 'error', error: 'Failed to load data' },
            }
          }));
        } else {
          throw error;
        }
      }

      // Update the state with processed data
      setDataState(prev => ({
        ...prev,
        isLoading: false,
        data: processedData,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      console.error("Error loading data:", error);
      setDataState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "An error occurred while loading the data"
      }));
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Generate mock data if needed
  const generateMockData = () => {
    // Generate mock data if we couldn't load preprocessed data
    return {
      overview: {
        totalRecords: 1245,
        totalLots: 78,
        overallRFTRate: 92.3,
        analysisStatus: 'Complete',
        rftPerformance: [
          { name: 'Pass', value: 1149, percentage: 92.3 },
          { name: 'Fail', value: 96, percentage: 7.7 }
        ],
        issueDistribution: [
          { name: 'Documentation Error', value: 42 },
          { name: 'Process Deviation', value: 28 },
          { name: 'Equipment Issue', value: 15 },
          { name: 'Material Issue', value: 11 }
        ],
        lotQuality: {
          pass: 72,
          fail: 6,
          percentage: 92.3,
          change: 1.5
        },
        processTimeline: [
          { month: 'Jan', recordRFT: 90.2, lotRFT: 91.5 },
          { month: 'Feb', recordRFT: 91.4, lotRFT: 92.0 },
          { month: 'Mar', recordRFT: 92.8, lotRFT: 93.1 },
          { month: 'Apr', recordRFT: 91.5, lotRFT: 92.3 },
          { month: 'May', recordRFT: 92.3, lotRFT: 93.5 },
          { month: 'Jun', recordRFT: 93.1, lotRFT: 94.0 }
        ]
      },
      internalRFT: {
        departmentPerformance: [
          { department: 'Production', pass: 328, fail: 22, rftRate: 93.7 },
          { department: 'Quality', pass: 248, fail: 12, rftRate: 95.4 },
          { department: 'Packaging', pass: 187, fail: 18, rftRate: 91.2 },
          { department: 'Logistics', pass: 156, fail: 24, rftRate: 86.7 }
        ],
        formErrors: [
          { name: 'Production Record', errors: 24, percentage: 18.2, trend: 'up' },
          { name: 'Batch Release', errors: 18, percentage: 13.6, trend: 'down' },
          { name: 'QC Checklist', errors: 15, percentage: 11.4, trend: 'flat' },
          { name: 'Material Transfer', errors: 12, percentage: 9.1, trend: 'down' },
          { name: 'Process Deviation', errors: 10, percentage: 7.6, trend: 'up' }
        ],
        errorTypePareto: [
          { name: 'Missing Signature', count: 32, cumulative: 32 },
          { name: 'Incorrect Information', count: 28, cumulative: 60 },
          { name: 'Incomplete Form', count: 18, cumulative: 78 },
          { name: 'Late Submission', count: 12, cumulative: 90 },
          { name: 'Illegible Entry', count: 6, cumulative: 96 }
        ]
      },
      externalRFT: {
        issueCategories: [
          { name: 'Documentation', value: 38 },
          { name: 'Quality', value: 27 },
          { name: 'Delivery', value: 18 },
          { name: 'Packaging', value: 12 },
          { name: 'Other', value: 5 }
        ],
        customerComments: [
          { category: 'Documentation', count: 38, sentiment: -0.2 },
          { category: 'Quality', count: 27, sentiment: -0.5 },
          { category: 'Delivery', count: 18, sentiment: -0.3 },
          { category: 'Packaging', count: 12, sentiment: -0.1 },
          { category: 'Other', count: 5, sentiment: 0 }
        ],
        correlationData: [
          { internalRFT: 92.3, externalRFT: 88.5, month: 'Jan' },
          { internalRFT: 93.1, externalRFT: 89.2, month: 'Feb' },
          { internalRFT: 91.8, externalRFT: 87.3, month: 'Mar' },
          { internalRFT: 94.2, externalRFT: 90.1, month: 'Apr' },
          { internalRFT: 95.1, externalRFT: 91.4, month: 'May' },
          { internalRFT: 94.8, externalRFT: 92.0, month: 'Jun' }
        ]
      },
      processMetrics: {
        reviewTimes: {
          NN: [2.8, 3.2, 3.5, 2.9, 3.1, 2.7],
          PCI: [3.4, 3.6, 3.2, 3.0, 2.9, 3.1]
        },
        cycleTimeBreakdown: [
          { step: 'Bulk Receipt', time: 1.2 },
          { step: 'Assembly', time: 3.5 },
          { step: 'PCI Review', time: 3.2 },
          { step: 'NN Review', time: 3.0 },
          { step: 'Packaging', time: 2.4 },
          { step: 'Final Review', time: 1.8 },
          { step: 'Release', time: 1.0 }
        ],
        waitingTimes: [
          { from: 'Bulk Receipt', to: 'Assembly', time: 0.5 },
          { from: 'Assembly', to: 'PCI Review', time: 1.2 },
          { from: 'PCI Review', to: 'NN Review', time: 0.8 },
          { from: 'NN Review', to: 'Packaging', time: 2.0 },
          { from: 'Packaging', to: 'Final Review', time: 0.7 },
          { from: 'Final Review', to: 'Release', time: 1.5 }
        ],
        totalCycleTime: {
          average: 21.8,
          target: 18.0,
          minimum: 16.2,
          maximum: 36.2
        }
      },
      lotData: {
        // Sample lot data
        B1001: { rftRate: 94.2, cycleTime: 16.5, hasErrors: false, releaseDate: '2025-02-15', department: 'Production' },
        B1002: { rftRate: 88.7, cycleTime: 18.2, hasErrors: true, releaseDate: '2025-02-20', department: 'Quality' },
        B1003: { rftRate: 96.3, cycleTime: 15.8, hasErrors: false, releaseDate: '2025-02-25', department: 'Production' },
        B1004: { rftRate: 90.1, cycleTime: 17.4, hasErrors: true, releaseDate: '2025-03-02', department: 'Packaging' },
        B1005: { rftRate: 93.8, cycleTime: 16.2, hasErrors: false, releaseDate: '2025-03-08', department: 'Production' }
      }
    };
  };

  // Function to refresh data
  const refreshData = () => {
    loadData();
  };

  // Value to be provided to consumers
  const contextValue = {
    isLoading: dataState.isLoading,
    error: dataState.error,
    data: dataState.data,
    fileStatus: dataState.fileStatus,
    lastUpdated: dataState.lastUpdated,
    refreshData
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Hook to use the data context
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

export default DataContext;

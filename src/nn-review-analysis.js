import React from 'react';
import { useDataContext } from './DataContext.js';

const NNReviewTimeAnalysis = () => {
  const { data, isLoading, error } = useDataContext();
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center py-8">
        <div className="animate-spin mx-auto mb-4 w-8 h-8 border-2 border-dashed rounded-full border-blue-500"></div>
        <p className="text-gray-600">Loading NN review time analysis...</p>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center py-8">
        <div className="mx-auto mb-4 w-12 h-12 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Data</h3>
        <p className="text-gray-600">{error || "No data available"}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-2">NN Review Time Analysis</h2>
      <p className="text-gray-500 mb-4">Analysis of Novo Nordisk review times</p>
      
      <div className="p-4 bg-gray-50 rounded">
        <p className="text-center text-gray-700">Review time data loaded successfully</p>
      </div>
    </div>
  );
};

export default NNReviewTimeAnalysis; 
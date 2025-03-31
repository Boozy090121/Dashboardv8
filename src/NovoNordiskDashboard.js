import React from 'react';
import { useDataContext } from './DataContext.js';

const NovoNordiskDashboard = () => {
  // Get data from context
  const { isLoading, error, data } = useDataContext();
  
  if (isLoading) {
    return <div className="p-4">Loading data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error loading data: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Novo Nordisk Manufacturing Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <h3 className="text-lg font-medium">Total Records</h3>
            <p className="text-3xl font-bold">{data?.overview?.totalRecords || 0}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h3 className="text-lg font-medium">Total Lots</h3>
            <p className="text-3xl font-bold">{data?.overview?.totalLots || 0}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h3 className="text-lg font-medium">Overall RFT Rate</h3>
            <p className="text-3xl font-bold">{data?.overview?.overallRFTRate || 0}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovoNordiskDashboard; 
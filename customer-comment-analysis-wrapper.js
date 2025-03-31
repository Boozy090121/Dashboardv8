import React from 'react';
import { useDataContext } from './DataContext.js';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Create a proper component implementation, not just a fallback
const CustomerCommentAnalysis = () => {
  const { data } = useDataContext();
  
  if (!data || !data.externalRFT) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Customer Comment Analysis</h3>
        <div className="p-4 bg-gray-100 rounded-md text-center">
          <p className="text-gray-500">Loading customer data...</p>
        </div>
      </div>
    );
  }

  // Process actual data from your context
  const { customerComments = [], issueCategories = [] } = data.externalRFT;
  
  // Create visualization data
  const sentimentData = [
    { 
      name: 'Positive', 
      value: customerComments.filter(c => c.sentiment > 0).reduce((sum, c) => sum + c.count, 0),
      color: '#4caf50' 
    },
    { 
      name: 'Neutral', 
      value: customerComments.filter(c => c.sentiment === 0).reduce((sum, c) => sum + c.count, 0),
      color: '#2196f3' 
    },
    { 
      name: 'Negative', 
      value: customerComments.filter(c => c.sentiment < 0).reduce((sum, c) => sum + c.count, 0),
      color: '#f44336' 
    }
  ];
  
  const totalComments = customerComments.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Customer Comment Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-md font-medium mb-2">Sentiment Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sentimentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Comments">
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 className="text-md font-medium mb-2">Category Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={issueCategories} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Create CustomerCommentAnalysis as a named export to satisfy any imports looking for this name
export { CustomerCommentAnalysis };

// Also export as default
export default CustomerCommentAnalysis; 
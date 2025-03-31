import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useDataContext } from './DataContext.js';

const FormErrorAnalysis = () => {
  // Get data from context
  const { data, isLoading, error } = useDataContext();
  
  // State for form error data and trend data
  const [formErrorData, setFormErrorData] = React.useState([]);
  const [trendData, setTrendData] = React.useState([]);
  
  // Update component when data changes
  React.useEffect(() => {
    if (data?.internalRFT?.formErrors) {
      setFormErrorData(data.internalRFT.formErrors);
      
      // Use monthly trend data from the context if available
      if (data.internalRFT.formErrorTrends) {
        setTrendData(data.internalRFT.formErrorTrends);
      }
    }
  }, [data]);
  
  // Filter options
  const [timeFilter, setTimeFilter] = React.useState('6m');
  const [departmentFilter, setDepartmentFilter] = React.useState('all');
  
  // Colors from Novo Nordisk spec
  const colors = {
    primary: '#db0032', // Novo Nordisk Red
    secondary: '#0066a4', // Complementary Blue
    tertiary: '#00a0af', // Teal Accent
    success: '#00843d', // Green
    warning: '#ffc72c', // Amber
    danger: '#c8102e', // Alert Red
    neutral: '#6c757d' // Light Text
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center py-8">
        <div className="animate-spin mx-auto mb-4 w-8 h-8 border-2 border-dashed rounded-full border-blue-500"></div>
        <p className="text-gray-600">Loading form error analysis...</p>
      </div>
    );
  }

  // Handle error state
  if (error || !data || !data.internalRFT || !data.internalRFT.formErrors) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center py-8">
        <div className="mx-auto mb-4 w-12 h-12 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Data</h3>
        <p className="text-gray-600">{error || "Form error data not available"}</p>
      </div>
    );
  }
  
  // Bar chart with error counts by form type
  const FormErrorBarChart = () => {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formErrorData}
            margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
            barSize={36}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ value: 'Error Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            />
            <Tooltip 
              formatter={(value, name) => [value, 'Errors']}
              labelFormatter={(label) => `Form: ${label}`}
            />
            <Bar 
              dataKey="errors" 
              fill={colors.primary}
              radius={[4, 4, 0, 0]}
            >
              {formErrorData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.trend === 'up' ? colors.danger : entry.trend === 'down' ? colors.success : colors.primary}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Line chart showing trends over time
  const FormErrorTrendChart = () => {
    // Only show top 3 forms in trend chart to avoid clutter
    const topForms = formErrorData.slice(0, 3).map(form => form.name);
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              label={{ value: 'Error Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            />
            <Tooltip />
            <Legend />
            {topForms.map((form, index) => (
              <Line
                key={form}
                type="monotone"
                dataKey={form}
                stroke={index === 0 ? colors.primary : index === 1 ? colors.secondary : colors.tertiary}
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Summary statistics
  const FormErrorSummary = () => {
    // Calculate total errors from real data
    const totalErrors = formErrorData.reduce((sum, item) => sum + item.errors, 0);
    
    // Calculate month-over-month change if we have trend data
    let monthlyChange = '0.0';
    let changeIsPositive = false;
    let topProblemForms = '';
    
    if (trendData && trendData.length >= 2) {
      const currentMonth = trendData[trendData.length - 1];
      const previousMonth = trendData[trendData.length - 2];
      
      const topForms = formErrorData.slice(0, 3).map(form => form.name);
      const totalCurrentMonth = topForms.reduce((sum, form) => sum + (currentMonth?.[form] || 0), 0);
      const totalPreviousMonth = topForms.reduce((sum, form) => sum + (previousMonth?.[form] || 0), 0);
      
      monthlyChange = totalPreviousMonth > 0 ? ((totalCurrentMonth - totalPreviousMonth) / totalPreviousMonth * 100).toFixed(1) : '0.0';
      changeIsPositive = totalCurrentMonth > totalPreviousMonth;
    }
    
    // Get top problem forms
    topProblemForms = formErrorData.slice(0, 3).map(item => item.name).join(', ');
    
    // Get insights from context data if available
    const insights = data.internalRFT.insights || [
      'Form error trends require additional data',
      'No significant pattern detected',
      'See detailed analysis for more info'
    ];
    
    return (
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Error Summary</h3>
          <p className="text-sm text-gray-600 mb-1">Total Form Errors: <span className="font-semibold">{totalErrors}</span></p>
          <p className="text-sm text-gray-600 mb-1">Top Problem Forms: <span className="font-semibold">{topProblemForms}</span></p>
          <p className="text-sm text-gray-600">
            Month-over-Month Change: 
            <span className={`font-semibold ml-1 ${changeIsPositive ? 'text-red-500' : 'text-green-500'}`}>
              {changeIsPositive ? '+' : ''}{monthlyChange}%
            </span>
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Insights</h3>
          <ul className="text-sm text-gray-600 list-disc pl-5">
            {insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };
  
  // Filter controls
  const FilterControls = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Time Period</label>
            <select 
              className="border rounded-md px-3 py-1 text-sm"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Department</label>
            <select 
              className="border rounded-md px-3 py-1 text-sm"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="production">Production</option>
              <option value="qc">Quality Control</option>
              <option value="packaging">Packaging</option>
            </select>
          </div>
        </div>
        
        <div>
          <button className="px-3 py-1 bg-gray-100 rounded-md text-sm mr-2">
            Export Data
          </button>
          <button className="px-3 py-1 bg-gray-100 rounded-md text-sm">
            View Details
          </button>
        </div>
      </div>
    );
  };
  
  // Render the full component
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-2">Form Error Analysis</h2>
      <p className="text-gray-500 mb-4">Analysis of form errors and trends</p>
      
      <FilterControls />
      <FormErrorSummary />
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Form Error Distribution</h3>
          <FormErrorBarChart />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Monthly Error Trends</h3>
          <FormErrorTrendChart />
        </div>
      </div>
    </div>
  );
};

export default FormErrorAnalysis; 
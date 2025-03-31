import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const NNReviewTimeAnalysis = () => {
  // Sample data for review times
  const [reviewData, setReviewData] = useState({
    monthlyAverages: [
      { month: 'Jan', averageTime: 4.2, targetTime: 3.0, lotCount: 12 },
      { month: 'Feb', averageTime: 3.8, targetTime: 3.0, lotCount: 14 },
      { month: 'Mar', averageTime: 3.5, targetTime: 3.0, lotCount: 13 },
      { month: 'Apr', averageTime: 3.2, targetTime: 3.0, lotCount: 15 },
      { month: 'May', averageTime: 3.1, targetTime: 3.0, lotCount: 12 },
      { month: 'Jun', averageTime: 2.9, targetTime: 3.0, lotCount: 14 }
    ],
    distributionData: [
      { range: '0-1 days', count: 3 },
      { range: '1-2 days', count: 12 },
      { range: '2-3 days', count: 24 },
      { range: '3-4 days', count: 18 },
      { range: '4-5 days', count: 10 },
      { range: '5+ days', count: 5 }
    ],
    correlationData: [
      { reviewTime: 1.2, qualityScore: 94, lot: 'B1001' },
      { reviewTime: 2.1, qualityScore: 96, lot: 'B1002' },
      { reviewTime: 2.8, qualityScore: 95, lot: 'B1003' },
      { reviewTime: 3.2, qualityScore: 93, lot: 'B1004' },
      { reviewTime: 3.5, qualityScore: 92, lot: 'B1005' },
      { reviewTime: 3.8, qualityScore: 94, lot: 'B1006' },
      { reviewTime: 4.1, qualityScore: 90, lot: 'B1007' },
      { reviewTime: 4.5, qualityScore: 89, lot: 'B1008' },
      { reviewTime: 5.0, qualityScore: 88, lot: 'B1009' },
      { reviewTime: 5.2, qualityScore: 87, lot: 'B1010' }
    ],
    boxPlotData: {
      min: 1.2,
      q1: 2.5,
      median: 3.2,
      q3: 4.1,
      max: 5.2,
      outliers: [0.8, 6.5]
    },
    departmentComparison: [
      { department: 'Formulation', averageTime: 2.8 },
      { department: 'Filling', averageTime: 3.2 },
      { department: 'Packaging', averageTime: 3.5 },
      { department: 'QC Testing', averageTime: 4.1 },
      { department: 'Final Review', averageTime: 2.7 }
    ],
    keyMetrics: {
      averageReviewTime: 3.2,
      targetTime: 3.0,
      complianceRate: 76,
      trendDirection: 'improving',
      improvementRate: 8.5
    }
  });
  
  // Colors from Novo Nordisk spec
  const colors = {
    primary: '#db0032', // Novo Nordisk Red
    secondary: '#0066a4', // Complementary Blue
    tertiary: '#00a0af', // Teal Accent
    success: '#00843d', // Green
    warning: '#ffc72c', // Amber
    danger: '#c8102e', // Alert Red
    neutral: '#6c757d', // Light Text
    lightBlue: '#e6f7ff', // Light blue for backgrounds
    lightRed: '#fff1f0' // Light red for backgrounds
  };
  
  // Time period filter
  const [timePeriod, setTimePeriod] = useState('6m');
  
  // Average review time trend chart
  const ReviewTimeTrendChart = () => {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={reviewData.monthlyAverages}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value) => [`${value} days`, 'Review Time']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <ReferenceLine 
              y={3} 
              stroke={colors.warning} 
              strokeDasharray="3 3" 
              label={{ value: 'Target: 3 days', position: 'right', fill: colors.warning, fontSize: 12 }} 
            />
            <Line 
              type="monotone" 
              dataKey="averageTime" 
              name="Average Review Time" 
              stroke={colors.primary} 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Distribution of review times chart
  const ReviewTimeDistributionChart = () => {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={reviewData.distributionData}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            barSize={40}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="range" />
            <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              formatter={(value) => [`${value} lots`, 'Count']}
              labelFormatter={(label) => `Review Time: ${label}`}
            />
            <Bar 
              dataKey="count" 
              fill={colors.secondary}
              radius={[4, 4, 0, 0]}
            >
              {reviewData.distributionData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={index < 3 ? colors.success : index < 5 ? colors.warning : colors.danger}
                />
              ))}
            </Bar>
            <ReferenceLine 
              x="2-3 days" 
              stroke={colors.warning} 
              strokeDasharray="3 3" 
              label={{ value: 'Target', position: 'top', fill: colors.warning, fontSize: 12 }} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Department comparison chart
  const DepartmentComparisonChart = () => {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={reviewData.departmentComparison}
            margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
            <YAxis type="category" dataKey="department" />
            <Tooltip 
              formatter={(value) => [`${value} days`, 'Average Review Time']}
            />
            <ReferenceLine x={3} stroke={colors.warning} strokeDasharray="3 3" />
            <Bar 
              dataKey="averageTime" 
              name="Average Review Time"
              fill={colors.tertiary}
              radius={[0, 4, 4, 0]}
            >
              {reviewData.departmentComparison.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.averageTime <= 3 ? colors.success : colors.danger}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Correlation scatter plot
  const QualityCorrelationChart = () => {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              dataKey="reviewTime" 
              name="Review Time"
              label={{ value: 'Review Time (days)', position: 'insideBottom', offset: -5 }}
              domain={[0, 6]} 
            />
            <YAxis 
              type="number" 
              dataKey="qualityScore" 
              name="Quality Score"
              label={{ value: 'Quality Score', angle: -90, position: 'insideLeft' }}
              domain={[85, 100]} 
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value, name) => [value, name === 'reviewTime' ? 'Review Time (days)' : 'Quality Score']}
              labelFormatter={(index) => reviewData.correlationData[index].lot}
            />
            <Scatter 
              name="Review Time vs Quality" 
              data={reviewData.correlationData} 
              fill={colors.secondary}
            >
              {reviewData.correlationData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.reviewTime <= 3 ? colors.success : colors.danger}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Box plot visualization (simplified as we don't have an actual Box Plot component)
  const BoxPlotVisualization = () => {
    const boxPlot = reviewData.boxPlotData;
    
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="text-xs font-medium text-gray-500 mr-2">Min: {boxPlot.min} days</div>
            <div className="text-xs font-medium text-gray-500 mr-2">Q1: {boxPlot.q1} days</div>
            <div className="text-xs font-medium text-gray-500 mr-2">Median: {boxPlot.median} days</div>
            <div className="text-xs font-medium text-gray-500 mr-2">Q3: {boxPlot.q3} days</div>
            <div className="text-xs font-medium text-gray-500">Max: {boxPlot.max} days</div>
          </div>
          
          <div className="relative h-20">
            {/* Axis */}
            <div className="absolute top-12 left-0 right-0 h-px bg-gray-300"></div>
            
            {/* Ticks */}
            {[0, 1, 2, 3, 4, 5, 6].map(tick => (
              <div 
                key={tick} 
                className="absolute top-12 h-2 w-px bg-gray-300"
                style={{ left: `${(tick / 6) * 100}%` }}
              >
                <div className="absolute -bottom-6 left-0 transform -translate-x-1/2 text-xs">{tick}</div>
              </div>
            ))}
            
            {/* Target line */}
            <div 
              className="absolute top-0 bottom-0 w-px bg-yellow-500"
              style={{ left: `${(3 / 6) * 100}%` }}
            >
              <div className="absolute -top-4 left-0 transform -translate-x-1/2 text-xs text-yellow-600">Target</div>
            </div>
            
            {/* Outliers */}
            {boxPlot.outliers.map((outlier, i) => (
              <div 
                key={i}
                className="absolute top-12 w-2 h-2 rounded-full bg-red-500 transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(outlier / 6) * 100}%` }}
              ></div>
            ))}
            
            {/* Box and whiskers */}
            <div 
              className="absolute top-6 h-12 bg-blue-100 border border-blue-500"
              style={{ 
                left: `${(boxPlot.q1 / 6) * 100}%`, 
                width: `${((boxPlot.q3 - boxPlot.q1) / 6) * 100}%` 
              }}
            ></div>
            
            {/* Median line */}
            <div 
              className="absolute top-6 bottom-6 w-px bg-blue-700"
              style={{ left: `${(boxPlot.median / 6) * 100}%` }}
            ></div>
            
            {/* Whiskers */}
            <div 
              className="absolute top-12 h-px bg-blue-500"
              style={{ 
                left: `${(boxPlot.min / 6) * 100}%`, 
                width: `${((boxPlot.q1 - boxPlot.min) / 6) * 100}%` 
              }}
            ></div>
            <div 
              className="absolute top-12 h-px bg-blue-500"
              style={{ 
                left: `${(boxPlot.q3 / 6) * 100}%`, 
                width: `${((boxPlot.max - boxPlot.q3) / 6) * 100}%` 
              }}
            ></div>
            
            {/* Min and max caps */}
            <div 
              className="absolute top-10 h-4 w-px bg-blue-500"
              style={{ left: `${(boxPlot.min / 6) * 100}%` }}
            ></div>
            <div 
              className="absolute top-10 h-4 w-px bg-blue-500"
              style={{ left: `${(boxPlot.max / 6) * 100}%` }}
            ></div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="text-sm font-medium">Review Time Distribution (days)</div>
          </div>
        </div>
      </div>
    );
  };
  
  // Key metrics cards
  const KeyMetricsCards = () => {
    const metrics = reviewData.keyMetrics;
    const isOnTarget = metrics.averageReviewTime <= metrics.targetTime;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${isOnTarget ? 'border-green-500' : 'border-red-500'}`}>
          <div className="flex flex-col">
            <div className="text-sm text-gray-500 mb-1">Average Review Time</div>
            <div className="flex items-end">
              <div className={`text-2xl font-bold ${isOnTarget ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.averageReviewTime} days
              </div>
              <div className="text-xs ml-2 mb-1 text-gray-500">
                Target: {metrics.targetTime} days
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex flex-col">
            <div className="text-sm text-gray-500 mb-1">Target Compliance Rate</div>
            <div className="flex items-end">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.complianceRate}%
              </div>
              <div className="text-xs ml-2 mb-1 text-gray-500">
                of reviews within target
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-teal-500">
          <div className="flex flex-col">
            <div className="text-sm text-gray-500 mb-1">Trend Direction</div>
            <div className="flex items-end">
              <div className="text-2xl font-bold text-teal-600 capitalize">
                {metrics.trendDirection}
              </div>
              <div className="text-xs ml-2 mb-1 text-gray-500">
                over last 6 months
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="flex flex-col">
            <div className="text-sm text-gray-500 mb-1">Improvement Rate</div>
            <div className="flex items-end">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.improvementRate}%
              </div>
              <div className="text-xs ml-2 mb-1 text-gray-500">
                vs. previous period
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Filter and controls
  const FiltersAndControls = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Time Period</label>
            <select 
              className="border rounded-md px-3 py-1 text-sm"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
            >
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>
        </div>
        
        <div>
          <button className="px-3 py-1 bg-gray-100 rounded-md text-sm mr-2">
            Export Analysis
          </button>
          <button className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-sm">
            Improvement Recommendations
          </button>
        </div>
      </div>
    );
  };
  
  // Insights section
  const InsightsSection = () => {
    return (
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Key Insights</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start">
            <span className="inline-block w-4 h-4 bg-green-500 rounded-full mr-2 mt-0.5"></span>
            <span>Review times have been consistently improving over the last 6 months, with current average below target.</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-4 h-4 bg-yellow-500 rounded-full mr-2 mt-0.5"></span>
            <span>QC Testing department shows the longest review times and presents the greatest opportunity for improvement.</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-4 h-4 bg-red-500 rounded-full mr-2 mt-0.5"></span>
            <span>Review times longer than 4 days correlate with lower quality scores, suggesting timely reviews are critical.</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2 mt-0.5"></span>
            <span>76% of reviews now complete within target time, up from 68% in the previous period.</span>
          </li>
        </ul>
      </div>
    );
  };
  
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">NN Review Time Analysis</h2>
        <p className="text-sm text-gray-600">Comprehensive analysis of Novo Nordisk review cycle times and their impact on quality</p>
      </div>
      
      <FiltersAndControls />
      <KeyMetricsCards />
      <InsightsSection />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Review Time Trend</h3>
          <p className="text-sm text-gray-500 mb-2">Average review time by month with target reference</p>
          <ReviewTimeTrendChart />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Review Time Distribution</h3>
          <p className="text-sm text-gray-500 mb-2">Distribution of review times across all lots</p>
          <ReviewTimeDistributionChart />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Department Comparison</h3>
          <p className="text-sm text-gray-500 mb-2">Average review times by department</p>
          <DepartmentComparisonChart />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Quality Correlation</h3>
          <p className="text-sm text-gray-500 mb-2">Relationship between review time and quality score</p>
          <QualityCorrelationChart />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-2">Review Time Distribution (Box Plot)</h3>
        <p className="text-sm text-gray-500 mb-2">Statistical distribution of review times</p>
        <BoxPlotVisualization />
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Improvement Recommendations</h3>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-md">
            <h4 className="font-medium text-blue-800">Standardize QC Testing Review Process</h4>
            <p className="text-sm text-blue-700">Implement standardized review templates and checklists to reduce QC Testing review times by an estimated 25%.</p>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-md">
            <h4 className="font-medium text-blue-800">Pre-Review Training Program</h4>
            <p className="text-sm text-blue-700">Train submitters on common errors to reduce review iterations and cut average review time by 15%.</p>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-md">
            <h4 className="font-medium text-blue-800">Parallel Review Workflow</h4>
            <p className="text-sm text-blue-700">Implement concurrent reviews for applicable criteria to reduce overall review cycle time.</p>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-md">
            <h4 className="font-medium text-blue-800">Automated Pre-Checks</h4>
            <p className="text-sm text-blue-700">Deploy validation tools to identify common issues before formal review begins.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NNReviewTimeAnalysis;
